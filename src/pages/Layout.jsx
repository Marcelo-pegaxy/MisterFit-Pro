import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  LayoutDashboard, Users, Dumbbell, Menu, UserCircle, ClipboardList, Salad,
  ClipboardCheck, MessageSquare, Landmark, Sparkles, Settings, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';

const trainerNavigation = [
  { title: 'Dashboard', url: createPageUrl('dashboard'), icon: LayoutDashboard },
  { title: 'Alunos', url: createPageUrl('Students'), icon: Users },
  { title: 'Criar Treinos', url: createPageUrl('Workouts'), icon: ClipboardList },
  { title: 'Criar Dietas', url: createPageUrl('Diets'), icon: Salad },
  { title: 'Chat', url: createPageUrl('Chat'), icon: MessageSquare },
  { title: 'Financeiro', url: createPageUrl('Financial'), icon: Landmark },
  { title: 'Sugestão IA', url: '/sugestao-ia', icon: Sparkles },
];

const studentNavigation = [
    { title: 'Meu Painel', url: createPageUrl('StudentDashboard'), icon: LayoutDashboard },
    { title: 'Meu Treino', url: createPageUrl('StudentWorkout'), icon: Dumbbell },
    { title: 'Minha Dieta', url: createPageUrl('StudentDiet'), icon: Salad },
    { title: 'Minhas Avaliações', url: createPageUrl('StudentAssessments'), icon: ClipboardCheck },
    { title: 'Chat', url: createPageUrl('Chat'), icon: MessageSquare },
];

// Navegação para Admin (igual ao trainer por agora)
const adminNavigation = [
  { title: 'Dashboard', url: createPageUrl('dashboard'), icon: LayoutDashboard },
  { title: 'Usuários', url: createPageUrl('Users'), icon: Users }, // Changed to 'Users' page for admin, assuming it exists or will exist
  { title: 'Treinos', url: createPageUrl('Workouts'), icon: ClipboardList },
  { title: 'Dietas', url: createPageUrl('Diets'), icon: Salad },
  { title: 'Chat', url: createPageUrl('Chat'), icon: MessageSquare },
  { title: 'Financeiro', url: createPageUrl('Financial'), icon: Landmark },
  { title: 'IA', url: '/sugestao-ia', icon: Sparkles },
];

const bottomNavigation = [
    { title: 'Meu Perfil', url: createPageUrl('Profile'), icon: UserCircle },
    { title: 'Configurações', url: createPageUrl('Settings'), icon: Settings },
];

const AppLogo = ({ userRole }) => (
  <Link to={createPageUrl(userRole === 'aluno' ? 'StudentDashboard' : 'dashboard')} className="flex items-center gap-3">
    <img 
      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/ee7cadce2_novologo.png" 
      alt="MisterFit Logo" 
      className="w-10 h-10 object-contain"
    />
    <h1 className="text-xl font-bold text-gray-800">MisterFit</h1>
  </Link>
);

const NavLinks = ({ items, className }) => {
  const location = useLocation();
  return (
    <nav className={`flex flex-col gap-1 ${className}`}>
      {items.map((item) => (
        <Link key={item.title} to={item.url}>
          <Button
            variant={location.pathname === item.url ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-3"
          >
            <item.icon className="w-4 h-4" />
            {item.title}
          </Button>
        </Link>
      ))}
    </nav>
  );
};

export default function Layout({ children, currentPageName }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    const handleLogout = () => {
        logout();
    };

    const mainNav = user.user_type === 'aluno' ? studentNavigation : 
                   user.user_type === 'admin' ? adminNavigation : 
                   trainerNavigation;
    
    const mobileBottomNav = (user.user_type === 'aluno') 
        ? [
            { title: 'Painel', url: createPageUrl('StudentDashboard'), icon: LayoutDashboard },
            { title: 'Treino', url: createPageUrl('StudentWorkout'), icon: Dumbbell },
            { title: 'Chat', url: createPageUrl('Chat'), icon: MessageSquare },
            { title: 'Perfil', url: createPageUrl('Profile'), icon: UserCircle },
          ]
        : [
            { title: 'Dashboard', url: createPageUrl('dashboard'), icon: LayoutDashboard },
            { title: user.user_type === 'admin' ? 'Usuários' : 'Alunos', url: createPageUrl(user.user_type === 'admin' ? 'Users' : 'Students'), icon: Users },
            { title: 'Chat', url: createPageUrl('Chat'), icon: MessageSquare },
            { title: 'Perfil', url: createPageUrl('Profile'), icon: UserCircle },
          ];

  return (
    <div className="min-h-screen w-full bg-[#F0F5FA] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-white p-4">
        <AppLogo userRole={user.user_type} />
        <NavLinks items={mainNav} className="mt-8" />
        <div className="mt-auto flex flex-col gap-1">
          <NavLinks items={bottomNavigation} />
           <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          {user && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-100 mt-4 border">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                    {user.full_name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{user.full_name}</p>
                    <p className="text-xs text-gray-500 capitalize">
                        {user.user_type === 'admin' ? 'Administrador' : 
                         user.user_type === 'personal' ? 'Personal Trainer' : 
                         'Aluno'}
                    </p>
                </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-white sticky top-0 z-40">
          <AppLogo userRole={user.user_type} />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-4 flex flex-col">
               <AppLogo userRole={user.user_type} />
               <NavLinks items={mainNav} className="mt-8" />
               <div className="mt-auto flex flex-col gap-1">
                  <NavLinks items={bottomNavigation} />
                   <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
                      <LogOut className="w-4 h-4" />
                      Sair
                    </Button>
               </div>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
            {children || <Outlet />}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
            <div className="flex justify-around items-center h-16">
                {mobileBottomNav.map((item) => (
                    <Link 
                        key={item.title} 
                        to={item.url} 
                        className={`flex flex-col items-center justify-center text-xs w-full h-full transition-colors ${
                            location.pathname === item.url ? 'text-orange-600' : 'text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        <item.icon className="w-5 h-5 mb-1" />
                        <span>{item.title}</span>
                    </Link>
                ))}
            </div>
        </footer>
      </div>
    </div>
  );
}

