import {
  Home,
  ClipboardPenLine,
  ChartColumnIncreasing,
  Clock,
  GraduationCap,
  Hourglass,
  UserSearch,
  Users,
  UserRoundPen,
  IdCard
} from 'lucide-react'

export interface MenuItem {
  icon: React.ComponentType<any>
  label: string
  href: string
  visible: string[]
}

export interface MenuGroup {
  title: string
  items: MenuItem[]
}
const MENU_ITEMS: MenuGroup[] = [
  {
    title: "MENU",
    items: [
      {
        icon: Home,
        label: "Home",
        href: "/admin",
        visible: ["admin", "student", "parent"],
      },
      {
        icon: GraduationCap,
        label: "Matrícula",
        href: "/list/enrollments",
        visible: ["admin"],
      },
      {
        icon: Clock,
        label: "Asistencias",
        href: "/list/attendance",
        visible: ["admin"],
      },
      {
        icon: ClipboardPenLine,
        label: "Examenes/Notas",
        href: "/list/exam",
        visible: ["admin"],
        //visible: ["admin", "teacher", "student", "parent"],
      },
      //{
      //  icon: IdCard,
      //  label: "Notas",
      //  href: "/list/result",
      //  visible: ["admin"],
      //},
      {
        icon: UserRoundPen,
        label: "Alumno",
        href: "/list/students",
        visible: [],
      },
      {
        icon: Users,
        label: "Padre",
        href: "/list/tutors",
        visible: [],
      },
      {
        icon: UserSearch,
        label: "Interesado/Externo",
        href: "/list/interested",
        visible: [],
      },
      {
        icon: ChartColumnIncreasing,
        label: "Reportes",
        href: "/list/reports",
        visible: ["admin"],
      },
      {
        icon: IdCard,
        label: "Metadata",
        href: "/list/metadata",
        visible: ["admin"],
      },
    ]
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