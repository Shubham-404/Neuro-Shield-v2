// src/pages/LandingPage.jsx
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { Button } from '../components/ui/button'

export default function LandingPage() {
  document.title = "Neuro Shield • Home"
  const heroRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )
  }, [])

  return (
    <div className="min-h-screen overflow-hidden flex flex-col items-center justify-center bg-linear-to-br from-indigo-500 via-blue-500 to-purple-600 text-white max-md:text-sm">
      <header className="z-100 sticky w-screen top-0 backdrop-blur-2xl bg-white/10 shadow-sm">
        <div className="container-px py-6 flex items-center justify-between text-white">
          <Link to='/' className="flex items-center gap-2 text-shadow-lg drop-shadow-lg drop-shadow-black/40 hover:text-shadow-xl hover:drop-shadow-xl hover:drop-shadow-black/60 active:text-shadow-md active:drop-shadow-md hover:drop-shadow-black/40">
            <div className="h-9 w-9 rounded-xl bg-center bg-cover">
              <img className='' src="/images/logo.png" alt="logo" />
            </div>
            <span className="font-semibold tracking-tight text-wrap ">Neuro Shield</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="#features" className="hover:opacity-90">Features</Link>
            <Link to="#steps" className="hover:opacity-90">How it works</Link>
            <Link to="#stats" className="hover:opacity-90">Outcomes</Link>
          </nav>
          <div className="space-x-2">
            <Link to="/login"><Button variant="subtle" className="bg-white/20 text-white hover:bg-white/30">Log in</Button></Link>
            <Link to="/register"><Button className="bg-white text-slate-900 hover:bg-slate-100">Get started</Button></Link>
          </div>
        </div>
      </header>
      <div ref={heroRef} className="w-full max-w-6xl px-6 md:px-12 py-12">

        {/* Hero Section */}
        <div className="relative flex items-center justify-center gap-6">
          {/* Background / Illustration */}
          <div className="h-full absolute w-full top-0 -z-1 opacity-80 max-lg:opacity-15 rounded-2xl bg-[url(/images/doctor.png)] bg-top-right bg-no-repeat" />

          <div className="flex flex-col min-w-sx p-5 justify-center items-start space-y-6 max-md:space-y-3">
            <h1 className="text-6xl w-2/3 max-md:text-4xl font-extrabold leading-tight">
              Predict stroke severity with confidence
            </h1>

            <p className="text-white/90 text-lg max-w-xl">
              A clinical decision support tool providing real-time risk
              stratification, explainability, and actionable recommendations.
            </p>

            <div className="flex flex-wrap gap-3 mt-4">
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100 font-semibold rounded-full px-6 py-3 shadow-lg transition-all"
                >
                  Open Dashboard
                </Button>
              </Link>
              <Link to="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 font-semibold rounded-full px-6 py-3 transition-all"
                >
                  Learn more
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">4.9</div>
                <div className="text-sm opacity-90">Clinician rating</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">+35%</div>
                <div className="text-sm opacity-90">Faster triage</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">HIPAA</div>
                <div className="text-sm opacity-90">Compliant</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id='features' className='mt-20'>
          <h2 className='p-10 text-center text-2xl font-bold'>Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { 
                icon: '🧠', 
                title: 'LIME Explainable AI', 
                desc: 'Get transparent, interpretable explanations for every prediction. See exactly which factors contribute to stroke risk with real-time feature importance analysis.' 
              },
              { 
                icon: '⚡', 
                title: 'Early Stroke Detection', 
                desc: 'Leverage advanced XGBoost machine learning to identify stroke risk factors early, enabling proactive intervention and better patient outcomes.' 
              },
              { 
                icon: '⚕️', 
                title: 'Streamlined Clinical Workflow', 
                desc: 'Complete patient assessments, run AI-powered predictions, and access comprehensive analytics—all in one integrated platform designed for healthcare professionals.' 
              },
              { 
                icon: '📊', 
                title: 'Real-Time Analytics', 
                desc: 'Monitor patient trends, risk distributions, and demographic insights with dynamic charts and dashboards that update automatically from your data.' 
              },
              { 
                icon: '👥', 
                title: 'Role-Based Access', 
                desc: 'Secure multi-role system supporting doctors, patients, and administrators with appropriate permissions and data access controls.' 
              },
              { 
                icon: '🔒', 
                title: 'Enterprise Security', 
                desc: 'HIPAA-compliant architecture with encrypted data transmission, secure authentication, and comprehensive audit trails for healthcare compliance.' 
              },
            ].map((f, i) => (
              <div
                key={i}
                className="p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-md hover:shadow-lg transition text-white"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-blue-500/20 rounded-full text-2xl">{f.icon}</div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Steps Section */}
        <div id="steps" className="max-w-5xl mx-auto mt-16">
          <h2 className="text-2xl font-bold mb-6 text-center">How it works</h2>
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { 
                step: '01', 
                title: 'Create Patient Profile', 
                desc: 'Enter patient demographics, medical history, and clinical measurements including age, BMI, glucose levels, and risk factors.' 
              },
              { 
                step: '02', 
                title: 'Run AI Prediction', 
                desc: 'Our XGBoost model analyzes patient data to calculate stroke risk probability with high accuracy using validated clinical features.' 
              },
              { 
                step: '03', 
                title: 'Review LIME Explanations', 
                desc: 'Understand why the model made its prediction with detailed feature contributions showing which factors increase or decrease stroke risk.' 
              },
              { 
                step: '04', 
                title: 'Take Action', 
                desc: 'Use risk assessments and insights to guide clinical decisions, prioritize care, and improve patient outcomes through early intervention.' 
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 bg-white/10 backdrop-blur-md rounded-2xl text-center"
              >
                <div className="text-3xl font-extrabold mb-2 text-blue-300">{item.step}</div>
                <h3 className="font-semibold mb-2 text-white">{item.title}</h3>
                <p className="text-white/70 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="max-w-5xl mx-auto mt-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Why NeuroShield?</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: 'Eases Doctor Workload',
                desc: 'Automate risk assessment calculations, reducing manual work and allowing doctors to focus on patient care and treatment decisions.'
              },
              {
                title: 'Better Health Services',
                desc: 'Enable data-driven healthcare with comprehensive analytics, trend monitoring, and evidence-based risk stratification for improved patient outcomes.'
              },
              {
                title: 'Early Detection Saves Lives',
                desc: 'Identify high-risk patients before symptoms worsen, enabling timely interventions and potentially preventing severe stroke complications.'
              },
              {
                title: 'Transparent AI Decisions',
                desc: 'Every prediction comes with clear explanations, building trust and helping clinicians understand the reasoning behind risk assessments.'
              }
            ].map((benefit, i) => (
              <div
                key={i}
                className="p-6 bg-white/10 backdrop-blur-md rounded-2xl text-white"
              >
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-white/80 text-sm leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <h2 className="text-2xl font-bold p-16 text-center">Developers</h2>
        <div id="stats" className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-5xl mx-auto ">
          {[
            ['Frontend Developer', 'Shubham'],
            ['ML Engineer', 'Sinchana'],
            ['Design & Documentation', 'Sree Dharshan'],
            ['Backend Engineer', 'Sudhanva'],
          ].map(([k, v], i) => (
            <div
              key={i}
              className="p-6 bg-white/10 backdrop-blur-md rounded-2xl text-center"
            >
              <div className="text-2xl font-bold">{v}</div>
              <div className="text-sm opacity-90">{k}</div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="max-w-5xl mx-auto mt-20 p-8 bg-white/10 backdrop-blur-md rounded-2xl flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h3 className="text-2xl font-bold">Ready to elevate stroke care?</h3>
            <p className="text-white/80">Start with a free trial and integrate into your workflow.</p>
          </div>
          <Link to="/register">
            <Button
              size="lg"
              className="bg-white text-slate-900 hover:bg-slate-100 font-semibold rounded-full px-6 py-3 shadow-lg transition-all"
            >
              Get started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
