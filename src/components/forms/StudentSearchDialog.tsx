// "use client";

// import { useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
// import { Input } from "../ui/input";
// import { Button } from "../ui/button";

// const StudentSearchDialog = ({
//   isOpen,
//   onClose,
//   onSelectStudent,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   onSelectStudent: (student: { id: string; firstName: string; lastName: string }) => void;
// }) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [students, setStudents] = useState([]);

//   const handleSearch = async () => {
//     // Lógica para buscar estudiantes en la API
//     const response = await fetch(`/api/students?query=${searchQuery}`);
//     const data = await response.json();
//     setStudents(data);
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Buscar Estudiante</DialogTitle>
//         </DialogHeader>
//         <div className="flex flex-col gap-4">
//           <Input
//             type="text"
//             placeholder="Buscar por nombre o código"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//           <Button onClick={handleSearch}>Buscar</Button>
//           <ul className="space-y-2">
//             {students.map((student:{
//               id: string;
//               firstName: string;
//               lastName: string;
//               code: string;
//             }) => (
//               <li
//                 key={student.id}
//                 className="p-2 hover:bg-gray-100 cursor-pointer"
//                 onClick={() => {
//                   onSelectStudent(student);
//                   onClose();
//                 }}
//               >
//                 {student.firstName} {student.lastName} - {student.code}
//               </li>
//             ))}
//           </ul>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default StudentSearchDialog;