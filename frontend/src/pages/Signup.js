import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(name, email, password, mobile);
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div
        className="hidden lg:block bg-cover bg-center relative"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1763386455796-2e5435b12cb3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3MjQyMTd8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMGFyY2hpdGVjdHVyZSUyMHdoaXRlJTIwbWluaW1hbGlzdHxlbnwwfHx8fDE3NjcwOTQ0MDR8MA&ixlib=rb-4.1.0&q=85')",
        }}
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="max-w-md">
            <h1 className="text-5xl font-heading font-bold text-white mb-6">
              Start Your Business Journey
            </h1>
            <p className="text-xl text-zinc-200">
              Professional accounting tools trusted by growing businesses and solar vendors
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-slate-900 mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-heading font-bold text-slate-900">
              Create your account
            </h2>
            <p className="mt-2 text-zinc-600">Get started with your free account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" data-testid="signup-form">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-zinc-700">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 h-11 rounded-lg border-zinc-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                placeholder="John Doe"
                data-testid="signup-name-input"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-zinc-700">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 h-11 rounded-lg border-zinc-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                placeholder="you@company.com"
                data-testid="signup-email-input"
              />
            </div>

            <div>
              <Label htmlFor="mobile" className="text-sm font-medium text-zinc-700">
                Mobile (Optional)
              </Label>
              <Input
                id="mobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="mt-1.5 h-11 rounded-lg border-zinc-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                placeholder="+1 234 567 8900"
                data-testid="signup-mobile-input"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-zinc-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 h-11 rounded-lg border-zinc-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                placeholder="••••••••"
                data-testid="signup-password-input"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-medium"
              data-testid="signup-submit-button"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-emerald-600 hover:text-emerald-700"
              data-testid="login-link"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
