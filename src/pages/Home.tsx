// import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getDataAggregate,
} from '../api/ApiCollection';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';



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
  let dataChart = Object.values(dataChartGrouped).flatMap((items: any) => {
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

  // add more data
  dataChart = dataChart.map((item: any) => {
    return { ...item, 
      cost_per_ppi: item.ppis_identified && item.ppis_identified !== 0 ? Math.round(item.cost_per_run / item.ppis_identified * 100) / 100 : 0,
      "cost_per_ppi_Deep Fractionation": item["ppis_identified_Deep Fractionation"] && item["ppis_identified_Deep Fractionation"] !== 0 ? Math.round(item["cost_per_run_Deep Fractionation"] / item["ppis_identified_Deep Fractionation"] * 100) / 100 : 0,
      "cost_per_ppi_XLMS Screening": item["ppis_identified_XLMS Screening"] && item["ppis_identified_XLMS Screening"] !== 0 ? Math.round(item["cost_per_run_XLMS Screening"] / item["ppis_identified_XLMS Screening"] * 100) / 100 : 0,

      ppi_per_ms_hour: item.ms_hours_used && item.ms_hours_used !== 0 ? Math.round(item.ppis_identified / item.ms_hours_used * 100) / 100 : 0,
      "ppi_per_ms_hour_Deep Fractionation": item["ms_hours_used_Deep Fractionation"] && item["ms_hours_used_Deep Fractionation"] !== 0 ? Math.round(item["ppis_identified_Deep Fractionation"] / item["ms_hours_used_Deep Fractionation"] * 100) / 100 : 0,
      "ppi_per_ms_hour_XLMS Screening": item["ms_hours_used_XLMS Screening"] && item["ms_hours_used_XLMS Screening"] !== 0 ? Math.round(item["ppis_identified_XLMS Screening"] / item["ms_hours_used_XLMS Screening"] * 100) / 100 : 0,

      "compounds_per_ms_hour_XLMS Screening": item["ms_hours_used_XLMS Screening"] && item["ms_hours_used_XLMS Screening"] !== 0 ? Math.round(item["compounds_screened_XLMS Screening"] / item["ms_hours_used_XLMS Screening"] * 100) / 100 : 0,

      "cost_per_compound_XLMS Screening": item["compounds_screened_XLMS Screening"] && item["compounds_screened_XLMS Screening"] !== 0 ? Math.round(item["cost_per_run_XLMS Screening"] / item["compounds_screened_XLMS Screening"] * 100) / 100 : 0,

      cost_k: item.cost_per_run ? Math.round(item.cost_per_run / 1000 * 100) / 100 : 0,
      "cost_k_Deep Fractionation": item["cost_per_run_Deep Fractionation"] ? Math.round(item["cost_per_run_Deep Fractionation"] / 1000 * 100) / 100 : 0,
      "cost_k_XLMS Screening": item["cost_per_run_XLMS Screening"] ? Math.round(item["cost_per_run_XLMS Screening"] / 1000 * 100) / 100 : 0,
    }
  });

  //console.log('dataChart', dataChart);

  return (
    // screen
    <div className="home w-full p-0 m-0">

      <h1 className='text-4xl font-bold mb-2'>Raw metrics</h1>
      <hr></hr>

      {/* grid */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-2 3xl:grid-cols-3 grid-flow-dense auto-rows-[minmax(200px,auto)] xl:auto-rows-[minmax(150px,auto)] gap-9 px-0 mt-4">

        <div className="box col-span-full sm:col-span-1 xl:col-span-1 ">
          <div className="w-full h-full p-0 m-0 flex flex-col items-start gap-4 xl:gap-7 justify-between">
            <span className="text-2xl xl:text-2xl 2xl:text-4xl">
              <span className='font-bold'>Total run costs</span>, k$ / month
            </span>

            <div className="flex xl:flex-col 2xl:flex-row gap-2 xl:gap-2 items-end xl:items-end 2xl:items-center">
              <span
                className={`text-2xl xl:text-xl 2xl:text-3xl font-bold`}
              >
                $ {dataChart.flatMap(item => item.cost_k).reduce((a, b) => a + b, 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}k
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
                  <YAxis label={{ value: 'Cost (k$)', angle: -90, offset: 10, position: 'insideBottomLeft' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="cost_k" stroke="#333" strokeWidth={2} name="Total"/>
                  <Line type="monotone" dataKey="cost_k_Deep Fractionation" stroke="#2980b9" strokeWidth={2} name="Deep Fractionation"/>
                  <Line type="monotone" dataKey="cost_k_XLMS Screening" stroke="#e67e22" strokeWidth={2} name="XLMS Screening"/>
                  <Legend align="right" verticalAlign="top" />
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


        <div className="box col-span-full sm:col-span-1 xl:col-span-1">
          <div className="w-full h-full p-0 m-0 flex flex-col items-start gap-4 xl:gap-7 justify-between">
            <span className="text-2xl xl:text-2xl 2xl:text-4xl">
              <span className='font-bold'>Instrument time</span>, MS hours / month
            </span>

            <div className="flex xl:flex-col 2xl:flex-row gap-2 xl:gap-2 items-end xl:items-end 2xl:items-center">
                <span
                  className={`text-2xl xl:text-xl 2xl:text-3xl font-bold`}
                >
                  {dataChart.flatMap(item => item.ms_hours_used).reduce((a, b) => a + b, 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                </span>
                <span className="font-medium xl:text-sm 2xl:text-base">
                  YTD
                </span>
              </div>

            <div className="w-full min-h-[300px] 2xl:min-h-[360px] 3xl:min-h-[420px]">

              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataChart}>
                  <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
                  <XAxis dataKey="year_month" />
                  <YAxis label={{ value: 'Instrument time (MS h)', angle: -90, offset: 10, position: 'insideBottomLeft' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="ms_hours_used" stroke="#333" fill="#fff" stackId={2} name="Total"/>
                  <Area type="monotone" dataKey="ms_hours_used_Deep Fractionation" stroke="#2980b9" fill="#2980b9" name="Deep Fractionation" stackId={1} />
                  <Area type="monotone" dataKey="ms_hours_used_XLMS Screening" stroke="#e67e22" fill="#e67e22" name="XLMS Screening" stackId={1} />
                  <Legend align="right" verticalAlign="top" />
                </AreaChart>
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


        <div className="box col-span-full sm:col-span-1 xl:col-span-1">
          <div className="w-full h-full p-0 m-0 flex flex-col items-start gap-4 xl:gap-7 justify-between">
            <span className="text-2xl xl:text-2xl 2xl:text-4xl">
              <span className='font-bold'>Unique PPIs detected</span>, # / month
            </span>

            <div className="flex xl:flex-col 2xl:flex-row gap-2 xl:gap-2 items-end xl:items-end 2xl:items-center">
                <span
                  className={`text-2xl xl:text-xl 2xl:text-3xl font-bold`}
                >
                  {dataChart.flatMap(item => item.ppis_identified).reduce((a, b) => a + b, 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                </span>
                <span className="font-medium xl:text-sm 2xl:text-base">
                  YTD
                </span>
              </div>

            <div className="w-full min-h-[300px] 2xl:min-h-[360px] 3xl:min-h-[420px]">

              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataChart}>
                  <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
                  <XAxis dataKey="year_month" />
                  <YAxis label={{ value: 'Unique PPIs (#)', angle: -90, offset: 8, position: 'insideBottomLeft' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="ppis_identified" stroke="#333" fill="#fff" name="Total" stackId={2} />
                  <Area type="monotone" dataKey="ppis_identified_Deep Fractionation" stroke="#2980b9" fill="#2980b9" name="Deep Fractionation" stackId={1} />
                  <Area type="monotone" dataKey="ppis_identified_XLMS Screening" stroke="#e67e22" fill="#e67e22" name="XLMS Screening" stackId={1} />
                  <Legend align="right" verticalAlign="top" />
                </AreaChart>
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

        <div className="box col-span-full sm:col-span-1 xl:col-span-1">
          <div className="w-full h-full p-0 m-0 flex flex-col items-start gap-4 xl:gap-7 justify-between">
            <span className="text-2xl xl:text-2xl 2xl:text-4xl">
              <span className='font-bold'>Compounds screened</span>, # / month
            </span>

            <div className="flex xl:flex-col 2xl:flex-row gap-2 xl:gap-2 items-end xl:items-end 2xl:items-center">
                <span
                  className={`text-2xl xl:text-xl 2xl:text-3xl font-bold`}
                >
                  {dataChart.flatMap(item => item.compounds_screened).reduce((a, b) => a + b, 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
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
                  <YAxis label={{ value: 'Compounds (#)', angle: -90, offset:10, position: 'insideBottomLeft' }} />
                  <Tooltip />
                  <Bar  dataKey="compounds_screened_XLMS Screening" fill="#e67e22" name="XLMS Screening"/>
                  <Legend align="right" verticalAlign="top" />
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


      <h1 className='text-4xl font-bold mb-2 mt-8'>Computed metrics</h1>
      <hr></hr>

      {/* grid */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-2 3xl:grid-cols-3 grid-flow-dense auto-rows-[minmax(200px,auto)] xl:auto-rows-[minmax(150px,auto)] gap-9 px-0 mt-4">

        <div className="box col-span-full sm:col-span-1 xl:col-span-1">
          <div className="w-full h-full p-0 m-0 flex flex-col items-start gap-4 xl:gap-7 justify-between">
            <span className="text-2xl xl:text-2xl 2xl:text-4xl">
              <span className='font-bold'>Cost per identified PPI</span>, $ / #
            </span>

            <div className="w-full min-h-[300px] 2xl:min-h-[360px] 3xl:min-h-[420px]">

              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataChart}>
                  <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
                  <XAxis dataKey="year_month" />
                  <YAxis label={{ value: 'Cost per identified PPI ($)', angle: -90, offset: 10, position: 'insideBottomLeft' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="cost_per_ppi" stroke="#333" strokeWidth={2} name="Average"/>
                  <Line type="monotone" dataKey="cost_per_ppi_Deep Fractionation" stroke="#2980b9" strokeWidth={2} name="Deep Fractionation"/>
                  <Line type="monotone" dataKey="cost_per_ppi_XLMS Screening" stroke="#e67e22" strokeWidth={2} name="XLMS Screening"/>
                  <Legend align="right" verticalAlign="top" />
                </LineChart>
              </ResponsiveContainer>
            
            </div>
    
          </div>
        </div>


        <div className="box col-span-full sm:col-span-1 xl:col-span-1">
          <div className="w-full h-full p-0 m-0 flex flex-col items-start gap-4 xl:gap-7 justify-between">
            <span className="text-2xl xl:text-2xl 2xl:text-4xl">
              <span className='font-bold'>Detected PPIs per instrument time</span>, # / hour
            </span>

            <div className="w-full min-h-[300px] 2xl:min-h-[360px] 3xl:min-h-[420px]">

              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataChart}>
                  <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
                  <XAxis dataKey="year_month" />
                  <YAxis label={{ value: 'PPIs (#)', angle: -90, offset: 10, position: 'insideBottomLeft' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="ppi_per_ms_hour" stroke="#333" strokeWidth={2} name="Average"/>
                  <Line type="monotone" dataKey="ppi_per_ms_hour_Deep Fractionation" stroke="#2980b9" strokeWidth={2} name="Deep Fractionation"/>
                  <Line type="monotone" dataKey="ppi_per_ms_hour_XLMS Screening" stroke="#e67e22" strokeWidth={2} name="XLMS Screening"/>
                  <Legend align="right" verticalAlign="top" />
                </LineChart>
              </ResponsiveContainer>
            
            </div>
    
          </div>
        </div>


        <div className="box col-span-full sm:col-span-1 xl:col-span-1">
          <div className="w-full h-full p-0 m-0 flex flex-col items-start gap-4 xl:gap-7 justify-between">
            <span className="text-2xl xl:text-2xl 2xl:text-4xl">
              <span className='font-bold'>Compounds screened per instrument time</span>, # / hour
            </span>

            <div className="w-full min-h-[300px] 2xl:min-h-[360px] 3xl:min-h-[420px]">

              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataChart}>
                  <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
                  <XAxis dataKey="year_month" />
                  <YAxis label={{ value: 'Compounds (#)', angle: -90, offset: 10, position: 'insideBottomLeft' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="compounds_per_ms_hour_XLMS Screening" stroke="#e67e22" strokeWidth={2} name="XLMS Screening"/>
                  <Legend align="right" verticalAlign="top" />
                </LineChart>
              </ResponsiveContainer>
            
            </div>
    
          </div>
        </div>

        <div className="box col-span-full sm:col-span-1 xl:col-span-1">
          <div className="w-full h-full p-0 m-0 flex flex-col items-start gap-4 xl:gap-7 justify-between">
            <span className="text-2xl xl:text-2xl 2xl:text-4xl">
              <span className='font-bold'>Cost per screened compound</span>, $ / #
            </span>

            <div className="w-full min-h-[300px] 2xl:min-h-[360px] 3xl:min-h-[420px]">

              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataChart}>
                  <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
                  <XAxis dataKey="year_month" />
                  <YAxis label={{ value: 'Cost per screened compound ($)', angle: -90, offset: 10, position: 'insideBottomLeft' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="cost_per_compound_XLMS Screening" stroke="#e67e22" strokeWidth={2} name="XLMS Screening"/>
                  <Legend align="right" verticalAlign="top" />
                </LineChart>
              </ResponsiveContainer>
            
            </div>
    
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default Home;
