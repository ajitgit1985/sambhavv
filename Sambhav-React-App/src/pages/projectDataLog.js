import React, { useState, useEffect, useRef, useMemo } from "react";
import { GetAllProjects, GetAllYears, GetQuarters } from "../api/pragyanAPI";
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";
import axios from "axios";
import { useParams } from "react-router-dom";
import Select from "react-select";
import Back from "../assets/images/back.svg";
import { saveAs } from "file-saver";
import Reset from "../assets/images/reset_icon.svg";
import { useNavigate } from "react-router-dom";
import { useTable, usePagination } from "react-table";
import { columValue } from "../constents/helpingMethods";
const ExcelJS = require("exceljs");

function DataTable({ columns, filteredData }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canPreviousPage,
    canNextPage,
    pageOptions,
    state: { pageIndex },
    gotoPage, // Add gotoPage
  } = useTable(
    {
      columns,
      data: filteredData, // Use filteredData for pagination
      initialState: { pageIndex: 0, pageSize: 20 }, // Set initial page size here
    },
    usePagination
  );

  const handlePageChange = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < pageOptions.length) {
      gotoPage(pageIndex);
    }
  };

  const pageRange = (pageIndex, pageCount) => {
    const start = Math.max(0, pageIndex - 4); // Adjust as needed
    const end = Math.min(start + 9, pageCount - 1); // Display 10 pages
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <>
      <div className="table-responsive">
        <table
          {...getTableProps()}
          className="NETable project_data_table table table-bordered table-hover"
        >
          <thead className="table-light">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()}>
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="table-group-divider">
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          Previous
        </button>{" "}
        {pageRange(pageIndex, pageOptions.length).map((index) => (
          <button
            className="innerPgItem"
            key={index}
            onClick={() => handlePageChange(index)}
            style={{
              fontWeight: pageIndex === index ? "bold" : "normal",
              backgroundColor: pageIndex === index ? "#085dad" : "#fff",
              color: pageIndex === index ? "#fff" : "#000",
            }}
          >
            {index + 1}
          </button>
        ))}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          Next
        </button>{" "}
      </div>
    </>
  );
}

const ProjectDataLog = () => {
  const [data, setData] = useState([]);
  const { projectCode } = useParams();
  const [projectOptions, setProjectOptions] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const selectInputRef = useRef();
  const navigate = useNavigate();
  // const [stateOptions, setStateOptions] = useState([]);
  // const [selectedState, setSelectedState] = useState(null);
  const [yearOptions, setYearOptions] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [quarterOptions, setQuarterOptions] = useState([]);
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  // const [projectStateFilter, setProjectStateFilter] = useState({ show: false });
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [filteredData, setFilteredData] = useState([]);

  // const [projectCode, setProjectCode] = useState("");

  const columns = useMemo(
    () => [
      { Header: "Sr. No.", accessor: "sn" },
      { Header: "project Name", accessor: "projectName" },
      // { Header: "State Code", accessor: "stateCode" },
      { Header: "State Name", accessor: "stateName" },
      // { Header: "Dist Code", accessor: "distCode" },
      { Header: "District Name", accessor: "districtName" },
      // { Header: "City Code", accessor: "cityCode" },
      { Header: "Block Name", accessor: "cityName" },
      // { Header: "village Code", accessor: "villageCode" },
      { Header: "village Name", accessor: "villageName" },
      { Header: "kpi Id", accessor: "kpiId" },
      { Header: "Indicator", accessor: "indicator" },
      { Header: "Value", accessor: "value" },
      { Header: "Unit", accessor: "unit" },
      { Header: "FY Qrtr", accessor: "financialQrtr" },
      { Header: "Year", accessor: "year" },
    ],
    []
  );

  useEffect(() => {
    fetchProjects();
    // fetchStates();
    fetchYears();
    fetchQuarters();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [data]);

  const fetchProjects = async () => {
    try {
      const data = await GetAllProjects();
      const options = data.map((project) => ({
        value: String(project.projectCode),
        label: project.projectName,
      }));
      setProjectOptions(options);

      const defaultOption = options.find((option) => option.value === "0");
      setSelectedProject(defaultOption);

      fetchData("0");
    } catch (error) {
      console.error("Error fetching sector data:", error);
    }
  };

  const handleProjects = (selectedOption) => {
    if (selectedOption) {
      setSelectedProject(selectedOption);
      // Fetch data for the selected project
      fetchData(selectedOption.value);
      // setSelectedState(null);
      setSelectedYear(null);
    }
  };

  // const fetchStates = async () => {
  //   try {
  //     const data = await GetAllState();
  //     const options = data.map((state) => ({
  //       value: state.stateCode,
  //       label: state.stateName,
  //     }));
  //     setStateOptions(options);
  //   } catch (error) {
  //     console.error("Error fetching state data:", error);
  //   }
  // };

  // const handleStates = (selectedOption) => {
  //   setSelectedState(selectedOption);

  //   let a;
  //   if (filteredData.length !== 0) {
  //     a = filteredData;
  //   } else {
  //     a = data;
  //   }
  //   const filteredData1 = a.filter(
  //     (item) => item.stateName === selectedOption.label
  //   );
  //   setFilteredData(filteredData1);
  // };

  const fetchQuarters = async () => {
    try {
      const data = await GetQuarters();
      const options = data.map((quarter) => ({
        value: quarter.quarterCode,
        label: quarter.quarterValue,
      }));
      setQuarterOptions(options);
    } catch (error) {
      console.error("Error fetching state data:", error);
    }
  };

  const handleQuarters = (selectedOption) => {
    setSelectedQuarter(selectedOption);

    const filteredData2 = data.filter(
      (item) => item.financialQrtr === selectedOption.label
    );
    setFilteredData(filteredData2);
    fetchYears(selectedOption.value);
    setSelectedYear(null);
  };

  const fetchYears = async () => {
    try {
      const data = await GetAllYears();
      const options = data.map((year) => ({
        value: year.yearCode,
        label: year.yearName,
      }));
      setYearOptions(options);
    } catch (error) {
      console.error("Error fetching state data:", error);
    }
  };

  const handleYears = (selectedOption) => {
    setSelectedYear(selectedOption);

    if (selectedQuarter) {
      // Both quarter and year are selected
      const newData = data.filter(
        (item) =>
          item.year === selectedOption.label &&
          item.financialQrtr === selectedQuarter.label
      );

      if (newData && newData.length > 0) {
        setFilteredData(newData);
        console.log("filteredData1", newData);
      } else {
        console.log("No data found for selected year and quarter");
      }
    } else {
      // Only year is selected
      const newData = data.filter((item) => item.year === selectedOption.label);

      if (newData && newData.length > 0) {
        setFilteredData(newData);
        console.log("filteredData1", newData);
      } else {
        console.log("No data found for selected year");
      }
    }
  };

  useEffect(() => {
    if (projectCode) {
      return fetchData(projectCode);
    }
  }, [projectCode]);

  // useEffect(() => {
  //   if (selectedQuarter) {
  //     const filtered = data.filter(
  //       (item) => item.financialQrtr === selectedQuarter.label
  //     );
  //     setFilteredData(filtered);
  //   } else {
  //     setFilteredData(data);
  //   }
  // }, [selectedQuarter, data]);

  const fetchData = async (projectCode) => {
    try {
      const response = await axios.get(
        `http://10.23.124.59:2222/getAllRawDataFromReplica?projectCode=${projectCode}`
      );
      setData(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    if (projectCode) {
      fetchData(projectCode);
    }
  }, [projectCode]);

  // console.log("data value: ", data);

  const exportToCSV = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("My Sheet");
    sheet.properties.defaultRowHeight = 25;

    sheet.getRow(1).border = {
      top: { style: "thin", color: { argb: "668cff" } },
      left: { style: "thin", color: { argb: "668cff" } },
      bottom: { style: "thin", color: { argb: "668cff" } },
      right: { style: "thin", color: { argb: "668cff" } },
    };

    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "darkVertical",
      fgColor: { argb: "e6ecff" },
    };

    sheet.getRow(1).font = {
      size: 16,
      bold: true,
    };

    sheet.columns = columValue;

    const promise = Promise.all(
      data?.map(async (product, index) => {
        const rowNumber = index + 2; // Start from the second row because the first row is the header
        const newRow = sheet.addRow({
          id: rowNumber - 1,
          projectName: product?.projectName,
          stateName: product?.stateName,
          districtName: product?.districtName,
          cityName: product?.cityName,
          kpiId: product?.kpiId,
          indicator: product?.indicator,
          value: product?.value,
          unit: product?.unit,
          financialQrtr: product?.financialQrtr,
          year: product?.year,
        });

        // Apply background color to alternate rows
        if (rowNumber % 2 === 0) {
          newRow.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "f2f2f2" },
            };
          });
        }

        // Apply border to each cell
        newRow.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "c8c8c8" } },
            left: { style: "thin", color: { argb: "c8c8c8" } },
            bottom: { style: "thin", color: { argb: "c8c8c8" } },
            right: { style: "thin", color: { argb: "c8c8c8" } },
          };
        });

        console.log(product?.thumbnail);
      })
    );
    promise.then(() => {
      const priceCol = sheet.getColumn(5);
      console.log("priceCol:P ", priceCol);
      // iterate over all current cells in this column
      priceCol.eachCell((cell) => {
        const cellValue = sheet.getCell(cell?.address).value;
        // add a condition to set styling
        if (cellValue > 50 && cellValue < 1000) {
          sheet.getCell(cell?.address).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "red" },
          };
        }
      });

      workbook.xlsx.writeBuffer().then(function (data) {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "download.xlsx";
        anchor.click();
        window.URL.revokeObjectURL(url);
      });
    });
  };

  const handleClear = () => {
    if (selectInputRef.current && selectInputRef.current.select) {
      selectInputRef.current.select.clearValue();
    }
    // setSelectedState(null);
    setSelectedYear(null);
    fetchProjects();
    setSelectedQuarter(null);
    navigate(`/projectdataLog`);
  };

  return (
    <div>
      <Header />
      <section className="BI__product__container">
        <div className="dropdown__header CKR_pad">
          <div className="container-fluid mb-2">
            <div className="flex row py-2">
              <div className="d-flex align-items-center justify-start col-md-10 px-1">
                <div className="row w-100">
                  <div className="btnbox px-1">
                    <a href="/dashboard" className="NEbtn back_btn">
                      <img src={Back} alt="reset icon" /> Back
                    </a>
                  </div>
                  <div className="col-4 px-1 select-container">
                    <Select
                      value={selectedProject}
                      placeholder="Select Project"
                      options={projectOptions}
                      onChange={handleProjects}
                    />
                  </div>
                  <div
                    className="col-2 px-1 select-container"
                    style={{ width: "170px" }}
                  >
                    <Select
                      options={quarterOptions}
                      onChange={handleQuarters}
                      value={selectedQuarter}
                      placeholder="Select Quarter"
                    />
                  </div>
                  <div className="col-2 px-1 select-container">
                    <Select
                      value={selectedYear}
                      placeholder="Select Year"
                      options={yearOptions}
                      onChange={handleYears}
                    />
                  </div>
                  <div className="box_reset px-1">
                    <button
                      className="NEbtn reset_btn px-2"
                      onClick={() => handleClear("")}
                      title="Reset Filter"
                    >
                      <img src={Reset} alt="reset icon" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="d-flex col-md-2 justify-content-end">
                {/* {projectStateFilter.show && ( */}

                {/*  <div className="col-3 px-1 select-container project_state_filter">
                  <Select
                    value={selectedState}
                    placeholder="Select State"
                    options={stateOptions}
                    onChange={handleStates}
                  />
                </div>*/}
                {/* )} */}
                {/* <div className="col-5">
                  <input
                    type="search"
                    placeholder="Search..."
                    className="form-control "
                    value=""
                  />
                </div> */}
                <div className="d-flex px-3">
                  <button
                    className="NEbtn export_btn"
                    onClick={() => exportToCSV()}
                    disabled={buttonDisabled}
                  >
                    Export to CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dept_color1 dept_container">
          <div className="container-fluid">
            <div className="row">
              <div className="tb">
                <DataTable columns={columns} filteredData={filteredData} />
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer className="overview_pad prayas__ml_250" />
    </div>
  );
};

export default ProjectDataLog;
