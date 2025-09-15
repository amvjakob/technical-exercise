import { read, utils } from "xlsx";

export const readExcelData = async () => {
  try {
    const path = "https://technical-exercise-aj.vercel.app/data";
    // const path = 'http://localhost:5173/data';
    const filename = 'TechEx_Anthony_Jakob_DummyData.xlsx';

    // console.log('fetching data from', `${path}/${filename}`);

    return await fetch(`${path}/${filename}`)
      // Take the response and turn the data into an array buffer
      .then(resp => resp.arrayBuffer())
      // User XLSX's read method to ingest the buffer and return the workbook
      .then(buff => {
        const file = read(buff);
        let data: any[] = [];
        const sheets = file.SheetNames;

        const keys = ["Start Date", "End Date", "start_date", "end_date"];

        for (let i = 0; i < sheets.length; i++) {
          const sheet = utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
          const sheetWithId = sheet.map((row: any, index: number) => { 
            row['id'] = index + 1;

            for (const key of keys) {
              if (row[key]) {
                // Convert Excel date to JS date
                const dt = new Date(Date.UTC(0, 0, row[key] - 1))
                row[key] = dt.toLocaleDateString();
                row[key + '_raw'] =  dt;
              }
            }

            if (row['Compounds Screened'] && typeof(row['Compounds Screened']) !== 'number')
              row['Compounds Screened'] = 0;
            
            return row;
          });
          data.push(sheetWithId);
        }
        //console.log(data);
        return data;
      })
      .catch(err => console.error(err));    
  }
  catch (err) {
    console.log(err);
  }
}

export const getDataAggregate = async () => {
  const data = await readExcelData();
  return data ? data[1] : [];
}

export const getDataFractionation = async () => {
  const data = await readExcelData();
  return data ? data[3] : [];
}

export const getDataScreening = async  () => {
  const data = await readExcelData();
  return data ? data[5] : [];
}