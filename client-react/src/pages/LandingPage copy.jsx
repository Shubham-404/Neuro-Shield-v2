import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-500 via-blue-500 to-purple-600">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
      <header className=" z-100 sticky top-0 backdrop-blur-2xl bg-white/10 shadow-2xs">
        <div className="container-px py-6 flex items-center justify-between text-white">
          <Link to='/' className="flex items-center gap-2 text-shadow-lg drop-shadow-lg drop-shadow-black/40 hover:text-shadow-xl hover:drop-shadow-xl hover:drop-shadow-black/60 active:text-shadow-md active:drop-shadow-md hover:drop-shadow-black/40">
            <div className="h-9 w-9 rounded-xl bg-center bg-cover">
              <img className='' src="/images/logo.png" alt="logo" />
            </div>
            <span className="font-semibold tracking-tight text-wrap ">Neuro Shield</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="hover:opacity-90">Features</a>
            <a href="#steps" className="hover:opacity-90">How it works</a>
            <a href="#stats" className="hover:opacity-90">Outcomes</a>
          </nav>
          <div className="space-x-2">
            <Link to="/login"><Button variant="subtle" className="bg-white/20 text-white hover:bg-white/30">Log in</Button></Link>
            <Link to="/register"><Button className="bg-white text-slate-900 hover:bg-slate-100">Get started</Button></Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="container-px pt-10 pb-16 md:pt-20 md:pb-24 text-white">
          <div className="grid md:grid-cols-2 min-h-[80vh] max-lg:relative overflow-hidden gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Predict stroke severity with confidence</h1>
              <p className="mt-4 text-white/90 text-lg">A clinical decision support tool providing real-time risk stratification, explainability, and actionable recommendations.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/dashboard"><Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100">Open Dashboard</Button></Link>
                <a href="#features"><Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">Learn more</Button></a>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="glass rounded-xl p-4">
                  <div className="text-2xl font-bold">4.9</div>
                  <div className="text-sm opacity-90">Clinician rating</div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-2xl font-bold">+35%</div>
                  <div className="text-sm opacity-90">Faster triage</div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-2xl font-bold">HIPAA</div>
                  <div className="text-sm opacity-90">Compliant</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl p-5 max-md:absolute border top-1/2 left-1/2 -translate-y-1/2 -z-1">
              <img alt="Hero" className="rounded-xl w-full object-cover" src="/images/doctor.png" />
            </div>
          </div>
        </section>

        <section id="features" className="container-px py-16">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { t: 'Explainable AI', d: 'Transparent SHAP-based insights for each prediction.' },
              { t: 'Clinical workflow', d: 'Built-in assessments, scoring, and documentation.' },
              { t: 'Security', d: 'Role-based access, audit logs, encryption.' },
            ].map((x, i) => (
              <div key={i} className="card card-hover p-6">
                <div className="h-10 w-10 rounded-lg bg-blue-600/10 text-blue-700 grid place-items-center font-semibold">{i + 1}</div>
                <h3 className="mt-4 text-lg font-semibold">{x.t}</h3>
                <p className="mt-2 text-sm text-slate-600">{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="steps" className="container-px py-16">
          <h2 className="text-2xl font-bold mb-6 text-white">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6 text-slate-900">
            {['Create patient', 'Complete assessment', 'View predictions'].map((s, i) => (
              <div key={i} className="glass rounded-xl p-6">
                <div className="text-3xl font-extrabold">0{i + 1}</div>
                <p className="mt-2 text-sm opacity-80">{s}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="stats" className="container-px py-16">
          <div className="grid md:grid-cols-4 gap-4 text-white">
            {[
              ['Hospitals', '120+'], ['Patients', '45k+'], ['Avg. time saved', '8.2m'], ['Alerts handled', '12k+']
            ].map(([k, v], i) => (
              <div key={i} className="glass rounded-xl p-6 text-center">
                <div className="text-3xl font-bold">{v}</div>
                <div className="text-sm opacity-90">{k}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="container-px py-20">
          <div className="glass rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between text-white">
            <div>
              <h3 className="text-2xl font-bold">Ready to elevate stroke care?</h3>
              <p className="opacity-90">Start with a free trial and integrate into your workflow.</p>
            </div>
            <Link to="/register"><Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100">Get started</Button></Link>
          </div>
        </section>
      </main>
    </div>
  )
}
