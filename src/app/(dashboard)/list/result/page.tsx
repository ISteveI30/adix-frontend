
interface ResultPageProps {

}

const ResultPage = (props: ResultPageProps) => {
    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">Pagina de Notas</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                </div>
            </div>
            <h1>Pagina de Notas</h1>
        </div>
    )
}
export default ResultPage;