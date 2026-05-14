import { motion } from 'framer-motion';
import { Calendar, Trophy, Users, Zap, Sparkles, Rocket, Target, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import DeveloperSection from '../components/DeveloperSection';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Event Management',
      description: 'Create, manage, and track all college events in one place',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Hackathon Platform',
      description: 'Host and participate in exciting hackathons with team collaboration',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Team Formation',
      description: 'Find teammates and collaborate on projects seamlessly',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'QR Attendance',
      description: 'Quick and secure attendance tracking with QR codes',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Digital Certificates',
      description: 'Auto-generate and verify certificates with blockchain',
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'AI Analytics',
      description: 'Smart insights and predictions powered by AI',
      gradient: 'from-pink-500 to-rose-500',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Students' },
    { value: '500+', label: 'Events Hosted' },
    { value: '100+', label: 'Hackathons' },
    { value: '95%', label: 'Satisfaction' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Rocket className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">NextGen Campus</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4"
          >
            <Button variant="ghost" onClick={() => navigate('/login')} className="text-white">
              Login
            </Button>
            <Button variant="outline" onClick={() => navigate('/about-developer')} className="bg-white/10 border-white/20 text-white">
              Developer
            </Button>
            <Button variant="primary" onClick={() => navigate('/register')}>
              Get Started
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 mb-6">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-white text-sm">AI-Powered Smart Campus Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Transform Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Campus Events </span>
            Experience
          </h1>
          
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            The ultimate platform for managing college events, hackathons, and student engagement with AI-powered insights and automation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate('/register')}
              className="group"
            >
              Start Free Trial
              <Rocket className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/20"
            >
              Explore Events
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
        >
          {stats.map((stat, index) => (
            <Card key={index} glass className="text-center">
              <h3 className="text-4xl font-bold text-white mb-2">{stat.value}</h3>
              <p className="text-gray-300">{stat.label}</p>
            </Card>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-300">
            Everything you need to manage campus events efficiently
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card glass hover className="h-full">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.gradient} mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <DeveloperSection />

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <Card glass className="text-center py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of students already using NextGen Campus
            </p>
            <Button size="lg" variant="primary" onClick={() => navigate('/register')}>
              Create Free Account
            </Button>
          </motion.div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-6 py-8 border-t border-white/10">
        <div className="text-center text-gray-400">
          <p>&copy; 2024 NextGen Smart Campus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
