
import { listEnrollments } from "@/api/enrollment/enrollment.api";
import FormModal from "@/components/customs/FormModal";
import Pagination from "@/components/customs/Pagination";
import TableSearch from "@/components/customs/TableSearch";
import TableView from "@/components/customs/TableView";
import {  role } from "@/lib/data";

type Enrollment = {
  id: string;
  startDate: string;
  endDate: string;
  student: string[];
  modality: string;
  shift: string;
  cycle: string[];
  career: string[];
  totalCost: number;
  initialPayment: number;
  discount: number;
};

const dataEnrollments: Enrollment[] = await listEnrollments();
console.log(dataEnrollments);

const columns = [
  {
    header: "Fecha de Matricula",
    accessor: "startDate",
  },
  {
    header: "Fecha de Fin",
    accessor: "endDate",
  },
  {
    header: "Estudiante",
    accessor: "student",
  },
  {
    header: "Modalidad",
    accessor: "modality",
  },
  {
    header: "Turno",
    accessor: "shift",
  },
  {
    header: "Ciclo",
    accessor: "cycle",
  },
  {
    header: "Carrera",
    accessor: "career",
  },
  {
    header: "Costo Total",
    accessor: "totalCost",    
    className: "hidden md:table-cell",
  },
  {
    header: "Pago Inicial",
    accessor: "initialPayment",
    className: "hidden md:table-cell",
  },
  {
    header: "Descuento",
    accessor: "discount",
    className: "hidden md:table-cell",
  },
  {
    header: "Acciones",
    accessor: "action",
  }
];

const EnrollmentListPage = () => {
  const renderRow = (item: Enrollment) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-userPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.startDate}</h3>
        </div>
      </td>
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.endDate}</h3>
        </div>
      </td>
      
      <td className="hidden md:table-cell">{item.student.join(",")}</td>
      <td className="hidden md:table-cell">{item.modality}</td>
      <td className="hidden md:table-cell">{item.shift}</td>
      <td className="hidden md:table-cell">{item.cycle.join(",")}</td>
      <td className="hidden md:table-cell">{item.career.join(",")}</td>
      <td className="hidden md:table-cell">{item.totalCost}</td>
      <td className="hidden md:table-cell">{item.initialPayment}</td>
      <td className="hidden md:table-cell">{item.discount}</td>

      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal table="enrollment" type="update" data={item} />
              <FormModal table="enrollment" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Lista de Matriculas</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-userYellow">
              <img src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-userYellow">
              <img src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && (
              <FormModal table="enrollment" type="create"/>
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <TableView columns={columns} renderRow={renderRow} data={dataEnrollments} />
      {/* PAGINATION */}
      <Pagination />
    </div>
  );
};

export default EnrollmentListPage;