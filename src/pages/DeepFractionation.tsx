import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from '../components/DataTable';
import { getDataFractionation } from '../api/ApiCollection';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const DeepFractionation = () => {
  const { isLoading, isError, isSuccess, data } = useQuery({
    queryKey: ['all_deep_fractionation'],
    queryFn: getDataFractionation,
  });

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 50 },
    {
      field: 'start_date_raw',
      headerName: 'Start Date',
      minWidth: 100,
      type: 'date',
      flex: 1,
    },
    {
      field: 'end_date_raw',
      headerName: 'End Date',
      minWidth: 100,
      type: 'date',
      flex: 1,
    },
    { 
      field: 'uniprot_a',
      headerName: 'UniProt A',
      minWidth: 100,
      flex: 1,
      renderCell: (params) => {
        return (
          <a href={`https://www.uniprot.org/uniprotkb?query=${params.row.uniprot_a}&sort=score`} target='_blank' rel='noreferrer' className="text-primary underline">
            {params.row.uniprot_a}
          </a>
        );
      },
    },
    { field: 'pos_a', headerName: 'Residue index A', minWidth: 100, flex: 1 },
    { 
      field: 'uniprot_b',
      headerName: 'UniProt B',
      minWidth: 100,
      flex: 1,
      renderCell: (params) => {
        return (
          <a href={`https://www.uniprot.org/uniprotkb?query=${params.row.uniprot_b}&sort=score`} target='_blank' rel='noreferrer' className="text-primary underline">
            {params.row.uniprot_b}
          </a>
        );
      },
    },
    { field: 'pos_b', headerName: 'Residue index B', minWidth: 100, flex: 1 },
    { field: 'fraction', headerName: 'Chrom. fraction identifier', minWidth: 100, flex: 1 },
    { field: 'fdr', headerName: 'False discovery rate', minWidth: 100, flex: 1 },

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
              Deep Fractionation Experiments
            </h2>
            {data && data.length > 0 && (
              <span className="text-neutral dark:text-neutral-content font-medium text-base">
                {data.length} deep fractionation experiments found
              </span>
            )}
          </div>
        </div>

        {isLoading ? (
          <DataTable
            slug="deep-fractionation"
            columns={columns}
            rows={[]}
            includeActionColumn={false}
          />
        ) : isSuccess ? (
          <DataTable
            slug="deep-fractionation"
            columns={columns}
            rows={data}
            includeActionColumn={false}
          />
        ) : (
          <>
            <DataTable
              slug="deep-fractionation"
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

export default DeepFractionation;
