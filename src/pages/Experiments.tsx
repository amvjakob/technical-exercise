import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from '../components/DataTable';
import { getDataAggregate } from '../api/ApiCollection';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const Experiments = () => {
  const { isLoading, isError, isSuccess, data } = useQuery({
    queryKey: ['all_experiments'],
    queryFn: getDataAggregate,
  });

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 50 },
    {
      field: 'Start Date_raw',
      headerName: 'Start Date',
      minWidth: 100,
      type: 'date',
      flex: 1,
    },
    {
      field: 'End Date_raw',
      headerName: 'End Date',
      minWidth: 100,
      type: 'date',
      flex: 1,
    },
    {
      field: 'Experiment Type',
      headerName: 'Experiment Type',
      minWidth: 150,
      flex: 1,
      type: 'singleSelect',
      valueOptions: ['Deep Fractionation', 'XLMS Screening'],
      renderCell: (params) => {
        return (
          <div className="flex flex-wrap gap-1">
            <div className="rounded-full bg-base-200 dark:bg-base-300 flex justify-center items-center px-3 py-1 text-xs">
              {params.row['Experiment Type']}
            </div>
          </div>
        );
      },
    },
    { field: 'MS Hours Used', headerName: 'MS Hours Used', type: 'number', minWidth: 100, flex: 1 },
    { field: 'Cost per Run (USD)', headerName: 'Cost per Run (USD)',  type: 'number', minWidth: 100, flex: 1 },
    { field: 'PPIs Identified', headerName: 'PPIs Identified', type: 'number',  minWidth: 100, flex: 1 },
    { field: 'Compounds Screened', headerName: 'Compounds Screened', type: 'number', minWidth: 100, flex: 1 },
    { field: 'Notes', headerName: 'Notes', minWidth: 250 },
    /*
    // {
    //   field: 'title',
    //   type: 'string',
    //   headerName: 'Title',
    //   width: 250,
    // },
    {
      field: 'inStock',
      headerName: 'In Stock',
      minWidth: 80,
      type: 'boolean',
      flex: 1,
    },*/
  ];

  React.useEffect(() => {
    if (isLoading) {
      toast.loading('Loading...', { id: 'promiseProducts' });
    }
    if (isError) {
      toast.error('An error occurred while getting the data.', {
        id: 'promiseProducts',
      });
    }
    if (isSuccess) {
      toast.success('Data loaded successfully!', {
        id: 'promiseProducts',
      });
    }
  }, [isError, isLoading, isSuccess]);

  return (
    <div className="w-full p-0 m-0">
      <div className="w-full flex flex-col items-stretch gap-3">
        <div className="w-full flex justify-between xl:mb-5">
          <div className="flex gap-1 justify-start flex-col items-start">
            <h2 className="font-bold text-2xl xl:text-4xl mt-0 pt-0 text-base-content dark:text-neutral-200">
              Experiments
            </h2>
            {data && data.length > 0 && (
              <span className="text-neutral dark:text-neutral-content font-medium text-base">
                {data.length} experiments found
              </span>
            )}
          </div>
          <button
            onClick={() => {}}
            className={`btn btn-disabled`}
          >
            Add new experiment +
          </button>
        </div>

        {isLoading ? (
          <DataTable
            slug="experiments"
            columns={columns}
            rows={[]}
            includeActionColumn={false}
          />
        ) : isSuccess ? (
          <DataTable
            slug="experiments"
            columns={columns}
            rows={data}
            includeActionColumn={false}
          />
        ) : (
          <>
            <DataTable
              slug="experiments"
              columns={columns}
              rows={[]}
              includeActionColumn={false}
            />
            <div className="w-full flex justify-center">
              Error while getting the data!
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Experiments;
