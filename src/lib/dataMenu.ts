
const MENU_ITEMS = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/admin",
        visible: ["admin", "student", "parent"],
      },
      {
        icon: "/student.png",
        label: "Interesado",
        href: "/list/interested",
        visible: [],
      },
      {
        icon: "/teacher.png",
        label: "Alumno",
        href: "/list/students",
        visible: [],
      },
      {
        icon: "/parent.png",
        label: "Padre",
        href: "/list/tutors",
        visible: [],
      },
      {
        icon: "/subject.png",
        label: "Matrícula",
        href: "/list/enrollments",
        visible: ["admin"],
      },
      // {
      //   icon: "/result.png",
      //   label: "Resultados",
      //   href: "/admin",
      //   visible: ["admin", "teacher", "student", "parent"],
      // },
      // {
      //   icon: "/attendance.png",
      //   label: "Asistencias",
      //   href: "/admin",
      //   visible: ["admin", "teacher", "student", "parent"],
      // },
      // {
      //   icon: "/calendar.png",
      //   label: "Pagos",
      //   href: "/admin",
      //   visible: ["admin", "teacher", "student", "parent"],
      // },
    ],
  },
  // {
  //   title: "OTHER",
  //   items: [
  //     {
  //       icon: "/profile.png",
  //       label: "Perfil",
  //       href: "/profile",
  //       visible: ["admin", "teacher", "student", "parent"],
  //     },
  //     {
  //       icon: "/setting.png",
  //       label: "Ajustes",
  //       href: "/settings",
  //       visible: ["admin", "teacher", "student", "parent"],
  //     },
  //     {
  //       icon: "/logout.png",
  //       label: "Cerrar Sesión",
  //       href: "/logout",
  //       visible: ["admin", "teacher", "student", "parent"],
  //     },
  //   ],
  // },
];

export default MENU_ITEMS;