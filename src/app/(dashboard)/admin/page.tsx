import AttendanceChart from "@/components/customs/AttendanceChart"
import CountChart from "@/components/customs/CountChart"
import FinanceChart from "@/components/customs/FinanceChart"
import UserCard from "@/components/customs/UserCard"

const AdminPage = () => {
  return (
    <section className="p-4 flex gap-4 flex-col md:flex-row">
      <section className="w-full lg:w-full flex flex-col gap-8">
        <article className="flex gap-4 justify-between flex-wrap">
          <UserCard type="Estudiante" />
          <UserCard type="Interesado" />
          <UserCard type="Ingresos" />
          <UserCard type="Gastos" />
        </article>
        <article className="flex gap-4 flex-col lg:flex-row">
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChart />
          </div>
          <div className="w-full lg:w-2/3 h-[450px]">
            <AttendanceChart />
          </div>
        </article>
        <article className="w-full h-[500px]">
          <FinanceChart />
        </article>
      </section>
      {/* <section className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements />
      </section> */}
    </section>
  )
}

export default AdminPage