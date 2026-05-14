import { motion } from 'framer-motion';
import { Code2, ExternalLink, Mail, MapPin, Sparkles, User } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';

const skills = ['React', 'Next.js', 'Node.js', 'MongoDB', 'Tailwind CSS', 'AI Integrations', 'Cloud Deployment', 'DevOps'];

const DeveloperSection = ({ detailed = false }: { detailed?: boolean }) => {
  const progress = [
    ['Frontend Engineering', 92],
    ['Backend APIs', 88],
    ['AI Integrations', 90],
    ['Cloud & DevOps', 82],
  ];

  return (
    <section className="relative z-10 container mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid lg:grid-cols-[0.85fr_1.15fr] gap-8 items-stretch"
      >
        <Card glass className="relative overflow-hidden border border-cyan-300/20">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-fuchsia-500/10 to-emerald-500/10" />
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-fuchsia-500 flex items-center justify-center mb-6 shadow-2xl shadow-cyan-500/20">
              <User className="w-16 h-16 text-white" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-cyan-200 text-sm mb-4">
              <Sparkles className="w-4 h-4" /> Full Stack & AI Developer
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">Harshavardan T</h2>
            <p className="text-cyan-200 mb-2">BE in Artificial Intelligence & Machine Learning (AIML)</p>
            <p className="flex items-center gap-2 text-gray-300 mb-6">
              <MapPin className="w-4 h-4" /> Davangere, Karnataka, India
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => window.open('https://github.com/', '_blank')} size="sm">
                <Code2 className="w-4 h-4 mr-2" /> GitHub
              </Button>
              <Button onClick={() => window.open('https://linkedin.com/', '_blank')} variant="secondary" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" /> LinkedIn
              </Button>
              <Button onClick={() => window.location.href = 'mailto:harsha7411156@gmail.com'} variant="outline" className="bg-white/10 border-white/20 text-white" size="sm">
                <Mail className="w-4 h-4 mr-2" /> Email
              </Button>
            </div>
          </div>
        </Card>

        <Card glass className="border border-white/10">
          <motion.p
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="overflow-hidden whitespace-nowrap text-cyan-200 font-mono mb-4"
          >
            Building futuristic AI-powered full-stack platforms...
          </motion.p>
          <p className="text-gray-300 leading-7 mb-6">
            Passionate Full Stack & AI Developer focused on building futuristic web applications,
            AI-powered platforms, scalable full-stack systems, and modern user experiences. Skilled
            in React, Next.js, Node.js, MongoDB, Tailwind CSS, AI integrations, and cloud deployment.
            Interested in AI innovation, modern frontend engineering, DevOps, and scalable SaaS
            platforms. Loves creating impactful real-world solutions using AI and modern technologies.
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {skills.map((skill) => (
              <motion.span
                key={skill}
                whileHover={{ y: -3, scale: 1.03 }}
                className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm text-white"
              >
                {skill}
              </motion.span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              ['Projects', '25+'],
              ['Stacks', '12+'],
              ['Focus', 'AI SaaS'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-white/10 border border-white/10 p-4">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-sm text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {detailed ? (
        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <Card glass>
            <h3 className="text-xl font-bold text-white mb-4">Skills Progress</h3>
            <div className="space-y-4">
              {progress.map(([label, value]) => (
                <div key={label as string}>
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>{label}</span>
                    <span>{value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${value}%` }}
                      viewport={{ once: true }}
                      className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card glass>
            <h3 className="text-xl font-bold text-white mb-4">Technology Stack</h3>
            <div className="grid grid-cols-2 gap-3">
              {['React', 'Node', 'MongoDB', 'Tailwind', 'AI APIs', 'Cloud'].map((item) => (
                <div key={item} className="p-3 rounded-xl bg-white/10 text-center text-white border border-white/10">
                  {item}
                </div>
              ))}
            </div>
          </Card>
          <Card glass>
            <h3 className="text-xl font-bold text-white mb-4">Achievements</h3>
            <div className="space-y-3 text-gray-300">
              <p>Built AI-powered web platforms</p>
              <p>Designed scalable full-stack systems</p>
              <p>Created modern responsive dashboards</p>
              <p>Integrated cloud-ready backend APIs</p>
            </div>
          </Card>
          <Card glass className="lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4">Experience Timeline</h3>
            <div className="space-y-4">
              {[
                ['2026', 'Building AI-powered SaaS and smart campus platforms'],
                ['2025', 'Advanced full-stack engineering with React, Node.js, and MongoDB'],
                ['2024', 'Focused AIML learning, frontend systems, and product engineering'],
              ].map(([year, text]) => (
                <div key={year} className="flex gap-4">
                  <div className="w-16 text-cyan-200 font-bold">{year}</div>
                  <div className="flex-1 border-l border-white/20 pl-4 text-gray-300">{text}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card glass>
            <h3 className="text-xl font-bold text-white mb-4">Contact</h3>
            <p className="text-gray-300 mb-4">Available for AI, full-stack, and modern web platform work.</p>
            <Button className="w-full" onClick={() => window.location.href = 'mailto:harsha7411156@gmail.com'}>
              Contact Developer
            </Button>
          </Card>
        </div>
      ) : null}
    </section>
  );
};

export default DeveloperSection;
