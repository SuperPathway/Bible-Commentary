import React, { useEffect, useState } from 'react';
import { User } from '@/entities/User';
import { Commentary } from '@/entities/Commentary';
import { Material } from '@/entities/Material';
import { ContactMessage } from '@/entities/ContactMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users as UsersIcon, DollarSign, BookOpen, FileText, Mail, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ totalUsers: 0, activeSubscriptions: 0, totalRevenue: 0, commentariesToday: 0, materialsCount: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [commentaries, setCommentaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const currentUser = await User.me();
      if (!currentUser || currentUser.email !== 'ddemails@yahoo.com') {
        setIsLoading(false);
        setUser(null);
        return;
      }
      setUser(currentUser);
      const [usersData, materialsData, messagesData, commentariesData] = await Promise.all([User.list(), Material.list(), ContactMessage.list(), Commentary.list()]);
      setUsers(usersData);
      setMaterials(materialsData);
      setMessages(messagesData);
      setCommentaries(commentariesData);
      const totalUsers = usersData.length;
      const activeSubscriptions = usersData.filter((u: any) => u.subscription_plan !== 'free').length;
      const totalRevenue = usersData.reduce((sum: number, u: any) => sum + (u.total_revenue || 0), 0);
      const today = new Date().toDateString();
      const commentariesToday = commentariesData.filter((c: any) => new Date(c.created_date).toDateString() === today).length;
      setStats({ totalUsers, activeSubscriptions, totalRevenue, commentariesToday, materialsCount: materialsData.length });
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const getUsageLimitForPlan = (plan: string) => ({ free: 3, basic: 20, standard: 45, pro: 110 } as any)[plan] || 0;

  const handleAddMaterial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const materialData = {
      title: String(formData.get('title')),
      category: String(formData.get('category')) as any,
      content: String(formData.get('content')),
      module_number: parseInt(String(formData.get('module_number') || '1'), 10),
      keywords: String(formData.get('keywords') || '').split(',').map((k) => k.trim()).filter(Boolean),
    };
    try {
      await Material.create(materialData as any);
      await loadAdminData();
      form.reset();
      alert('Material added successfully!');
    } catch (error) {
      alert('Error adding material');
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await Material.delete(materialId);
        await loadAdminData();
      } catch {}
    }
  };

  const handleMarkMessageRead = async (messageId: string) => {
    try {
      await ContactMessage.update(messageId, { status: 'read' } as any);
      await loadAdminData();
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-semibold mb-2">Not authorized</h2>
        <p className="text-gray-600">Sign in as admin to view the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your supernatural commentary ministry</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Total Users</p><p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p></div><UsersIcon className="w-8 h-8 text-blue-600" /></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Active Subscriptions</p><p className="text-3xl font-bold text-green-600">{stats.activeSubscriptions}</p></div><DollarSign className="w-8 h-8 text-green-600" /></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Total Revenue</p><p className="text-3xl font-bold text-purple-600">${stats.totalRevenue}</p></div><BarChart3 className="w-8 h-8 text-purple-600" /></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Commentaries Today</p><p className="text-3xl font-bold text-amber-600">{stats.commentariesToday}</p></div><BookOpen className="w-8 h-8 text-amber-600" /></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Materials</p><p className="text-3xl font-bold text-indigo-600">{stats.materialsCount}</p></div><FileText className="w-8 h-8 text-indigo-600" /></div></CardContent></Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle>Recent Users</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {users.slice(0, 5).map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{u.email}</p>
                            <p className="text-sm text-gray-500">{format(new Date(u.created_date), 'MMM d, yyyy')}</p>
                          </div>
                          <Badge variant="secondary" className="capitalize">{u.subscription_plan}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Recent Commentaries</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {commentaries.slice(0, 5).map((c) => (
                        <div key={c.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium truncate">{c.passage}</p>
                          <p className="text-sm text-gray-500 capitalize">{c.user_plan} • {format(new Date(c.created_date), 'MMM d, yyyy')}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="materials" className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center space-x-2"><Plus className="w-5 h-5" /><span>Add New Material</span></CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleAddMaterial} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input name="title" placeholder="Material Title" required />
                      <Select name="category" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="commentary">Biblical Commentary</SelectItem>
                          <SelectItem value="divine-promises">Divine Promises</SelectItem>
                          <SelectItem value="supernatural">Supernatural</SelectItem>
                          <SelectItem value="prophetic">Prophetic</SelectItem>
                          <SelectItem value="ministry">Ministry</SelectItem>
                          <SelectItem value="acts-model">Acts Model</SelectItem>
                          <SelectItem value="authority">Authority</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input name="module_number" type="number" min="1" max="8" placeholder="Module Number (1-8)" required />
                    <Input name="keywords" placeholder="Keywords (comma separated)" />
                    <Textarea name="content" placeholder="Material Content" rows={8} required />
                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700"><Plus className="w-4 h-4 mr-2" />Add Material</Button>
                  </form>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Existing Materials</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {materials.map((m) => (
                      <div key={m.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{m.title}</h3>
                          <p className="text-sm text-gray-600 capitalize mt-1">{String(m.category).replace('-', ' ')} • Module {m.module_number}</p>
                          <p className="text-sm text-gray-500 mt-2">{String(m.content).substring(0, 150)}...</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteMaterial(m.id)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader><CardTitle>User Management</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{u.email}</p>
                          <p className="text-sm text-gray-500">Usage: {u.usage_count} / {getUsageLimitForPlan(u.subscription_plan)} • Joined: {format(new Date(u.created_date), 'MMM d, yyyy')}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="capitalize">{u.subscription_plan}</Badge>
                          {u.payment_status && <Badge variant={u.payment_status === 'active' ? 'default' : 'secondary'}>{u.payment_status}</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center space-x-2"><Mail className="w-5 h-5" /><span>Contact Messages</span></CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {messages.map((m) => (
                      <div key={m.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{m.name}</p>
                            <p className="text-sm text-gray-600">{m.email}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={m.status === 'new' ? 'default' : 'secondary'}>{m.status}</Badge>
                            <span className="text-xs text-gray-500">{format(new Date(m.created_date), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{m.message}</p>
                        {m.status === 'new' && (<Button size="sm" variant="outline" onClick={() => handleMarkMessageRead(m.id)}>Mark as Read</Button>)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}