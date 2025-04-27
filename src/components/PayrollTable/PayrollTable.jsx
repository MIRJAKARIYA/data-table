import { useState, useMemo } from "react";
import { Table, Input, DatePicker, Button, Modal } from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  DownOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import Papa from "papaparse";
import { generateDummyData } from "../../utils/dataGenerator";
import { formatDate } from "../../utils/dateConverter";
import { isDateInRange } from "../../utils/dateRangeCheck";
const dummyData = generateDummyData(100);

const { RangePicker } = DatePicker;

const PayrollTable = () => {
  const [searchText, setSearchText] = useState("");
  const [singleDate, setSingleDate] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showMostHoursModal, setShowMostHoursModal] = useState(false);
  const [showMostEfficientModal, setShowMostEfficientModal] = useState(false);

  const clearFilters = () => {
    setSearchText("");
    setSingleDate(null);
    setDateRange([null, null]);
  };

  const filteredData = useMemo(() => {
    let data = [...dummyData];

    if (searchText) {
      data = data.filter(
        (item) =>
          item.employeeName.toLowerCase().includes(searchText.toLowerCase()) ||
          item.propertyName.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (dateRange?.[0] && dateRange?.[1]) {
      const start = formatDate(dateRange?.[0]?.["$d"]);

      const end = formatDate(dateRange?.[1]?.["$d"]);
      data = data.filter((item) => isDateInRange(item?.date, start, end));
      return data;
    } else if (singleDate) {
      const dates = formatDate(singleDate?.["$d"]);
      data = data.filter((item) => item.date.includes(dates));
    }

    return data;
  }, [searchText, singleDate, dateRange]);

  const groupedData = useMemo(() => {
    const sortedData = [...filteredData].sort((a, b) =>
      a.employeeName.localeCompare(b.employeeName)
    );
    const grouped = [];
    let currentGroup = [];
    let currentEmployee = null;

    sortedData.forEach((item, index) => {
      if (item.employeeName !== currentEmployee) {
        if (currentGroup.length > 0) {
          const totalTimeWorked = currentGroup.reduce((sum, row) => {
            const time = parseInt(row.timeWorked.split(" ")[0]) || 0;
            return sum + time;
          }, 0);
          const totalUnits = currentGroup.reduce(
            (sum, row) => sum + row.noOfUnits,
            0
          );
          const avgSecPerUnit =
            totalUnits > 0 ? (totalTimeWorked * 60) / totalUnits : 0;

          grouped.push(...currentGroup);
          grouped.push({
            key: `total-${currentEmployee}-${index}`,
            employeeName: currentEmployee,
            isTotal: true,
            totalTimeWorked: `${totalTimeWorked} min`,
            totalUnits,
            avgSecPerUnit: avgSecPerUnit.toFixed(2),
          });
        }
        currentGroup = [];
        currentEmployee = item.employeeName;
      }
      currentGroup.push({ ...item, key: index });
    });

    if (currentGroup.length > 0) {
      const totalTimeWorked = currentGroup.reduce((sum, row) => {
        const time = parseInt(row.timeWorked.split(" ")[0]) || 0;
        return sum + time;
      }, 0);
      const totalUnits = currentGroup.reduce(
        (sum, row) => sum + row.noOfUnits,
        0
      );
      const avgSecPerUnit =
        totalUnits > 0 ? (totalTimeWorked * 60) / totalUnits : 0;

      grouped.push(...currentGroup);
      grouped.push({
        key: `total-${currentEmployee}-${sortedData.length}`,
        employeeName: currentEmployee,
        isTotal: true,
        totalTimeWorked: `${totalTimeWorked} min`,
        totalUnits,
        avgSecPerUnit: avgSecPerUnit.toFixed(2),
      });
    }

    return grouped;
  }, [filteredData]);

  // Calculate who works the most hours
  const mostHoursEmployee = useMemo(() => {
    const employeeHours = filteredData.reduce((acc, item) => {
      const time = parseInt(item.timeWorked.split(" ")[0]) || 0;
      acc[item.employeeName] = (acc[item.employeeName] || 0) + time;
      return acc;
    }, {});
    return Object.entries(employeeHours).reduce(
      (a, b) => (a[1] > b[1] ? a : b),
      ["", 0]
    );
  }, [filteredData]);

  // Calculate who is the most efficient
  const mostEfficientEmployee = useMemo(() => {
    const employeeEfficiency = filteredData.reduce((acc, item) => {
      const avgSec = parseFloat(item.avgSecPerUnit) || 0;
      if (!acc[item.employeeName]) {
        acc[item.employeeName] = { total: avgSec, count: 1 };
      } else {
        acc[item.employeeName].total += avgSec;
        acc[item.employeeName].count += 1;
      }
      return acc;
    }, {});
    const totalEfficiency = Object.entries(employeeEfficiency).map(
      ([name, { total, count }]) => [name, total / count]
    );
    return totalEfficiency.reduce(
      (a, b) => (a[1] < b[1] ? a : b),
      ["", Infinity]
    );
  }, [filteredData]);

  // Define table columns
  const columns = [
    {
      title: (
        <span className="flex items-center justify-center">
          Employee Name <DownOutlined className="ml-1 text-gray-500" />
        </span>
      ),
      dataIndex: "employeeName",
      key: "employeeName",
      width: "15%",
      render: (text, record) => {
        if (record.isTotal) {
          return {
            children: (
              <div className="flex w-full bg-transparent relative left-[58%]">
                <div className="w-[50%] flex items-center">
                  <span className="font-bold text-gray-800">
                    TOTAL TIME WORKED
                  </span>
                </div>
                <div className="w-[11%] text-right text-gray-600">
                  {record.totalTimeWorked}
                </div>
                <div className="w-[19%] text-right text-gray-600">
                  {record.totalUnits}
                </div>
                <div className="w-[20%] text-right text-gray-600">
                  {record.avgSecPerUnit}
                </div>
              </div>
            ),
            props: { colSpan: 5 },
          };
        }
        return <span className="text-gray-800">{text}</span>;
      },
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: "12%",
      render: (text, record) =>
        record.isTotal ? (
          { props: { colSpan: 0 } }
        ) : (
          <span className="text-gray-600">{text}</span>
        ),
    },
    {
      title: "Property Name",
      dataIndex: "propertyName",
      key: "propertyName",
      width: "15%",
      render: (text, record) =>
        record.isTotal ? (
          { props: { colSpan: 0 } }
        ) : (
          <span className="text-gray-600">{text}</span>
        ),
    },
    {
      title: "Check In",
      dataIndex: "checkIn",
      key: "checkIn",
      width: "12%",
      render: (text, record) =>
        record.isTotal ? (
          { props: { colSpan: 0 } }
        ) : (
          <span className="text-gray-600">{text}</span>
        ),
    },
    {
      title: "Check Out",
      dataIndex: "checkOut",
      key: "checkOut",
      width: "12%",
      render: (text, record) =>
        record.isTotal ? (
          { props: { colSpan: 0 } }
        ) : (
          <span className="text-gray-600">{text}</span>
        ),
    },
    {
      title: "Time Worked",
      dataIndex: "timeWorked",
      key: "timeWorked",
      width: "12%",
      align: "right",
      render: (text, record) =>
        record.isTotal ? (
          { props: { colSpan: 0 } }
        ) : (
          <span className="text-gray-600">{text}</span>
        ),
    },
    {
      title: "No of Units",
      dataIndex: "noOfUnits",
      key: "noOfUnits",
      width: "12%",
      align: "right",
      render: (text, record) =>
        record.isTotal ? (
          { props: { colSpan: 0 } }
        ) : (
          <span className="text-gray-600">{text}</span>
        ),
    },
    {
      title: "Avg. sec/unit",
      dataIndex: "avgSecPerUnit",
      key: "avgSecPerUnit",
      width: "12%",
      align: "right",
      render: (text, record) =>
        record.isTotal ? (
          { props: { colSpan: 0 } }
        ) : (
          <span className="text-gray-600">{text}</span>
        ),
    },
  ];

  // Handle CSV download
  const handleDownloadCSV = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "payroll_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Payroll List</h1>
      <div className="flex justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search by Property or Employee"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
          />
          <DatePicker
            value={singleDate}
            onChange={(date) => setSingleDate(date)}
            placeholder="04-23-2025"
            format="MM-DD-YYYY"
            className="w-40"
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            format="MM-DD-YYYY"
            placeholder={["02-23-2025", "04-23-2025"]}
            className="w-80"
          />
          <Button
            onClick={clearFilters}
            icon={<ClearOutlined />}
            className="flex items-center"
          >
            Clear Filters
          </Button>
          <Button
            type="primary"
            onClick={() => setShowMostHoursModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            Most Hours
          </Button>
          <Button
            type="primary"
            onClick={() => setShowMostEfficientModal(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Most Efficient
          </Button>
        </div>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownloadCSV}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Download CSV
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={groupedData}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredData.length,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          },
          showTotal: (total) => `Total ${total}`,
        }}
        scroll={{ y: 400 }}
        rowClassName={(record, index) =>
          record.isTotal
            ? "font-bold"
            : index % 2 === 0
            ? "bg-white"
            : "bg-gray-50"
        }
      />
      <Modal
        title="Employee with Most Hours"
        open={showMostHoursModal}
        onCancel={() => setShowMostHoursModal(false)}
        footer={null}
      >
        <p>
          The employee with the most hours worked is:{" "}
          <strong>{mostHoursEmployee[0]}</strong> with{" "}
          <strong>{mostHoursEmployee[1]} minutes</strong>.
        </p>
      </Modal>
      <Modal
        title="Most Efficient Employee"
        open={showMostEfficientModal}
        onCancel={() => setShowMostEfficientModal(false)}
        footer={null}
      >
        <p>
          The most efficient employee is:{" "}
          <strong>{mostEfficientEmployee[0]}</strong> with an average of{" "}
          <strong>
            {mostEfficientEmployee[1].toFixed(2)} seconds per unit
          </strong>
          .
        </p>
      </Modal>
    </div>
  );
};

export default PayrollTable;
