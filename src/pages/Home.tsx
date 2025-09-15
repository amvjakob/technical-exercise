// import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getDataAggregate,
} from '../api/ApiCollection';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';



type ObjectKey = string | number | symbol

export const groupBy = <
  K extends ObjectKey,
  TItem extends Record<K, ObjectKey>
>(
  items: TItem[],
  key: K
): Record<ObjectKey, TItem[]> =>
  items.reduce(
    (result, item) => ({
      ...result,
      [item[key]]: [...(result[item[key]] || []), item],
    }),
    {} as Record<ObjectKey, TItem[]>
  )

function aggregateToMonthYear(data: any[]) {
  const result: any[] = [];
  const map = new Map();

  data.forEach(item => {
    const key = item.year_month;
    if (!map.has(key)) {
      let val = { ...item };
      delete val.x;
      if (typeof(val.compounds_screened) !== 'number')
        val.compounds_screened = 0;

      map.set(key, val);
    } else {
      const existing = map.get(key);
      existing.ms_hours_used += item.ms_hours_used;
      existing.cost_per_run += item.cost_per_run;
      existing.ppis_identified += item.ppis_identified;
      if (typeof(item.compounds_screened) === 'number')
        existing.compounds_screened += item.compounds_screened;
    }
  });

  map.forEach(value => result.push(value));
  return result;
}


const Home = () => {
  const { isLoading, isError, isSuccess, data } = useQuery({
      queryKey: ['all_experiments'],
      queryFn: getDataAggregate,
    });

  if (isLoading) {
    return <div>Loading...</div>;
  } else if (isError || isSuccess) {
    // # do nothing
  }

  const rawDataChart = data.map((item: any) => ({
    x: item['End Date_raw'],
    year_month: item['End Date'].slice(-4) + '-' + ('0' + (new Date(item['End Date']).getMonth() + 1)).slice(-2),
    type: item['Experiment Type'],
    ms_hours_used: item['MS Hours Used'],
    cost_per_run: item['Cost per Run (USD)'],
    ppis_identified: item['PPIs Identified'],
    compounds_screened: item['Compounds Screened'],
  }));

  const rawDataGrouped = groupBy(rawDataChart, 'type');
  const dataChartByType = Object.values(rawDataGrouped).flatMap(aggregateToMonthYear);

  const dataChartGrouped = groupBy(dataChartByType, 'year_month');
  const dataChart = Object.values(dataChartGrouped).flatMap((items: any) => {
    const namedItems = items.map((item: any) => { 
      let newObj = {};
      for (const key in item) {
        newObj = {...newObj, ...{[key + '_' + item['type']]: item[key]}};
      }
      return newObj;
    });
    
    const total = aggregateToMonthYear(items);
    const combined = [ ...namedItems, ...total ];

    if (combined.length == 1) {
      return combined[0];
    } 
    else if (combined.length == 2) {
      return { ...combined[0], ...combined[1] };
    }
    else if (combined.length == 3) {
      return { ...combined[0], ...combined[1], ...combined[2] };
    }
    else {
      return {};
    }
  });

  //console.log('dataChart', dataChart);

  return (
    // screen
    <div className="home w-full p-0 m-0">
      {/* grid */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-2 grid-flow-dense auto-rows-[minmax(200px,auto)] xl:auto-rows-[minmax(150px,auto)] gap-3 xl:gap-3 px-0">

        <div className="box row-span-2 col-span-full sm:col-span-1 xl:col-span-1 3xl:row-span-2">
          <div className="w-full h-full p-0 m-0 flex flex-col items-start gap-4 xl:gap-7 justify-between">
            <span className="text-2xl xl:text-2xl 2xl:text-4xl font-bold">
              Total costs
            </span>

            <div className="flex xl:flex-col 2xl:flex-row gap-2 xl:gap-2 items-end xl:items-end 2xl:items-center">
                <span
                  className={`text-2xl xl:text-xl 2xl:text-3xl font-bold`}
                >
                  $ {dataChart.flatMap(item => item.cost_per_run).reduce((a, b) => a + b, 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
                <span className="font-medium xl:text-sm 2xl:text-base">
                  YTD
                </span>
              </div>

            <div className="w-full min-h-[300px] 2xl:min-h-[360px] 3xl:min-h-[420px]">

              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataChart}>
                  <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
                  <XAxis dataKey="year_month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cost_per_run" stroke="#777" strokeWidth={2} name="Total"/>
                  <Line type="monotone" dataKey="cost_per_run_Deep Fractionation" stroke="#82ca9d" strokeWidth={2} name="Deep Fractionation"/>
                  <Line type="monotone" dataKey="cost_per_run_XLMS Screening" stroke="#8884d8" strokeWidth={2} name="XLMS Screening"/>
                  <Legend align="right" />
                </LineChart>
              </ResponsiveContainer>
            
            </div>
            <div>
              <div className="flex xl:flex-col 2xl:flex-row gap-2 xl:gap-2">
                <a
                  href='/experiments'
                  className="px-0 py-0 min-h-0 max-h-5 btn btn-link font-medium text-base-content no-underline m-0"
                >
                  View details
                </a>
              </div>              
            </div>
        
          </div>
        </div>


        <div className="box row-span-2 col-span-full sm:col-span-1 xl:col-span-1 3xl:row-span-2">
          <div className="w-full h-full p-0 m-0 flex flex-col items-start gap-4 xl:gap-7 justify-between">
            <span className="text-2xl xl:text-2xl 2xl:text-4xl font-bold">
              Total MS hours
            </span>

            <div className="flex xl:flex-col 2xl:flex-row gap-2 xl:gap-2 items-end xl:items-end 2xl:items-center">
                <span
                  className={`text-2xl xl:text-xl 2xl:text-3xl font-bold`}
                >
                  {dataChart.flatMap(item => item.ms_hours_used).reduce((a, b) => a + b, 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
                <span className="font-medium xl:text-sm 2xl:text-base">
                  YTD
                </span>
              </div>

            <div className="w-full min-h-[300px] 2xl:min-h-[360px] 3xl:min-h-[420px]">

              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataChart}>
                  <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
                  <XAxis dataKey="year_month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="ms_hours_used" stroke="#777" strokeWidth={2} name="Total"/>
                  <Line type="monotone" dataKey="ms_hours_used_Deep Fractionation" stroke="#82ca9d" strokeWidth={2} name="Deep Fractionation"/>
                  <Line type="monotone" dataKey="ms_hours_used_XLMS Screening" stroke="#8884d8" strokeWidth={2} name="XLMS Screening"/>
                  <Legend align="right" />
                </LineChart>
              </ResponsiveContainer>
            
            </div>
            <div>
              <div className="flex xl:flex-col 2xl:flex-row gap-2 xl:gap-2">
                <a
                  href='/experiments'
                  className="px-0 py-0 min-h-0 max-h-5 btn btn-link font-medium text-base-content no-underline m-0"
                >
                  View details
                </a>
              </div>              
            </div>
        
          </div>
        </div>


        <div className="box row-span-2 col-span-full sm:col-span-1 xl:col-span-1 3xl:row-span-2">
          <div className="w-full h-full p-0 m-0 flex flex-col items-start gap-4 xl:gap-7 justify-between">
            <span className="text-2xl xl:text-2xl 2xl:text-4xl font-bold">
              Total PPIs identified
            </span>

            <div className="flex xl:flex-col 2xl:flex-row gap-2 xl:gap-2 items-end xl:items-end 2xl:items-center">
                <span
                  className={`text-2xl xl:text-xl 2xl:text-3xl font-bold`}
                >
                  {dataChart.flatMap(item => item.ppis_identified).reduce((a, b) => a + b, 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
                <span className="font-medium xl:text-sm 2xl:text-base">
                  YTD
                </span>
              </div>

            <div className="w-full min-h-[300px] 2xl:min-h-[360px] 3xl:min-h-[420px]">

              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataChart}>
                  <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
                  <XAxis dataKey="year_month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="ppis_identified" stroke="#777" strokeWidth={2} name="Total"/>
                  <Line type="monotone" dataKey="ppis_identified_Deep Fractionation" stroke="#82ca9d" strokeWidth={2} name="Deep Fractionation"/>
                  <Line type="monotone" dataKey="ppis_identified_XLMS Screening" stroke="#8884d8" strokeWidth={2} name="XLMS Screening"/>
                  <Legend align="right" />
                </LineChart>
              </ResponsiveContainer>
            
            </div>
            <div>
              <div className="flex xl:flex-col 2xl:flex-row gap-2 xl:gap-2">
                <a
                  href='/experiments'
                  className="px-0 py-0 min-h-0 max-h-5 btn btn-link font-medium text-base-content no-underline m-0"
                >
                  View details
                </a>
              </div>              
            </div>
        
          </div>
        </div>



        <div className="box row-span-2 col-span-full sm:col-span-1 xl:col-span-1 3xl:row-span-2">
          <div className="w-full h-full p-0 m-0 flex flex-col items-start gap-4 xl:gap-7 justify-between">
            <span className="text-2xl xl:text-2xl 2xl:text-4xl font-bold">
              Total compounds screened
            </span>

            <div className="flex xl:flex-col 2xl:flex-row gap-2 xl:gap-2 items-end xl:items-end 2xl:items-center">
                <span
                  className={`text-2xl xl:text-xl 2xl:text-3xl font-bold`}
                >
                  {dataChart.flatMap(item => item.compounds_screened).reduce((a, b) => a + b, 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
                <span className="font-medium xl:text-sm 2xl:text-base">
                  YTD
                </span>
              </div>

            <div className="w-full min-h-[300px] 2xl:min-h-[360px] 3xl:min-h-[420px]">

              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataChart}>
                  <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
                  <XAxis dataKey="year_month" />
                  <YAxis />
                  <Tooltip />
                  <Bar  dataKey="compounds_screened_XLMS Screening" fill="#8884d8" name="XLMS Screening"/>
                  <Legend align="right" />
                </BarChart>
              </ResponsiveContainer>
            
            </div>
            <div>
              <div className="flex xl:flex-col 2xl:flex-row gap-2 xl:gap-2">
                <a
                  href='/experiments'
                  className="px-0 py-0 min-h-0 max-h-5 btn btn-link font-medium text-base-content no-underline m-0"
                >
                  View details
                </a>
              </div>              
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default Home;
