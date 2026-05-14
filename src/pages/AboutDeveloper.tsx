import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DeveloperSection from '../components/DeveloperSection';
import Button from '../components/ui/Button';

const AboutDeveloper = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-fuchsia-950">
      <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white">
          <Rocket className="w-8 h-8 text-cyan-300" />
          <span className="text-2xl font-bold">NextGen Campus</span>
        </button>
        <Button onClick={() => navigate('/login')}>Login</Button>
      </nav>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 container mx-auto px-6 pt-10 text-center"
      >
        <p className="text-cyan-200 font-medium mb-3">About Developer</p>
        <h1 className="text-5xl font-bold text-white">Futuristic Full Stack & AI Engineering</h1>
      </motion.div>
      <DeveloperSection detailed />
    </div>
  );
};

export default AboutDeveloper;
