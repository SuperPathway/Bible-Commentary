import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/entities/User';
import { Cross, Home, CreditCard, Mail, BookOpen, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const u = await User.me();
        setUser(u);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await User.logout();
    setUser(null);
  };

  const handleLogin = async () => {
    await User.login();
    const u = await User.me();
    setUser(u);
  };

  const isAdmin = user?.email === 'ddemails@yahoo.com';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50">
      <nav className="sticky top-0 z-50 border-b" style={{ background: 'rgba(88, 28, 135, 0.95)', backdropFilter: 'blur(10px)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={createPageUrl('Home')} className="flex items-center space-x-3 group">
              <div className="relative">
                <img src="/vite.svg" alt="Logo" className="w-8 h-8 object-contain" />
                <Cross className="w-8 h-8 text-white hidden" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Supernatural Commentary</h1>
                <p className="text-purple-200 text-sm hidden sm:block">Divine Biblical Insights</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link to={createPageUrl('Home')} className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${location.pathname === createPageUrl('Home') ? 'bg-purple-100 text-purple-800' : 'text-white hover:text-purple-200 hover:bg-purple-800'}`}>
                <Home className="w-4 h-4" />
                <span className="font-medium">Home</span>
              </Link>
              <Link to={createPageUrl('About')} className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${location.pathname === createPageUrl('About') ? 'bg-purple-100 text-purple-800' : 'text-white hover:text-purple-200 hover:bg-purple-800'}`}>
                <BookOpen className="w-4 h-4" />
                <span className="font-medium">About</span>
              </Link>
              <Link to={createPageUrl('Pricing')} className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${location.pathname === createPageUrl('Pricing') ? 'bg-purple-100 text-purple-800' : 'text-white hover:text-purple-200 hover:bg-purple-800'}`}>
                <CreditCard className="w-4 h-4" />
                <span className="font-medium">Pricing</span>
              </Link>
              <Link to={createPageUrl('Contact')} className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${location.pathname === createPageUrl('Contact') ? 'bg-purple-100 text-purple-800' : 'text-white hover:text-purple-200 hover:bg-purple-800'}`}>
                <Mail className="w-4 h-4" />
                <span className="font-medium">Contact</span>
              </Link>
              {isAdmin && (
                <Link to={createPageUrl('AdminDashboard')} className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${location.pathname === createPageUrl('AdminDashboard') ? 'bg-amber-100 text-amber-800' : 'text-white hover:text-amber-200 hover:bg-amber-700'}`}>
                  <BarChart3 className="w-4 h-4" />
                  <span className="font-medium">Admin</span>
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="w-8 h-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-purple-800">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-amber-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{user.email.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="hidden sm:block text-white font-medium">{user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem>{user.email}</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <span className="text-red-600">Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={handleLogin} className="bg-white hover:bg-gray-100 text-purple-800 border border-white">Sign In</Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </main>

      <footer className="bg-gray-900 text-white mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img src="/vite.svg" alt="Logo" className="w-6 h-6 object-contain" />
                <Cross className="w-6 h-6 text-purple-400 hidden" />
                <h3 className="text-xl font-bold">Supernatural Commentary</h3>
              </div>
              <p className="text-gray-400 mb-4">Unlocking divine revelation and supernatural understanding of God's Word.</p>
              <p className="text-gray-400 text-sm">Salvation Centre Ministries – Full Gospel<br/>Gateway to the Heavenlies</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-purple-300">
                <li><Link to={createPageUrl('Home')} className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to={createPageUrl('About')} className="hover:text-white transition-colors">About</Link></li>
                <li><Link to={createPageUrl('Pricing')} className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to={createPageUrl('Contact')} className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ministry</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Supernatural Pathway</li>
                <li>Acts Model Living</li>
                <li>Supernatural Authority</li>
                <li>Divine Connection</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Supernatural Commentary. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}