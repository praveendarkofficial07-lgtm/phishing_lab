import React from 'react';
import {
  BookOpen,
  ShieldAlert,
  Cpu,
  Link2,
  FileCode,
  SearchCode,
  Scale,
  Workflow,
  AlertCircle
} from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800">
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-sky-400" />
          <span>Security Operations Center Documentation & Methodology</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Technical specifications, threat taxonomy, algorithmic risk scoring, and operational boundaries
        </p>
      </div>

      {/* Section 1: Threat Taxonomy */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-lg space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>1. Threat Taxonomy & Phishing Mechanics</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Phishing is a form of social engineering where threat actors deceive targets into executing malicious actions—such as divulging corporate credentials, executing unauthorized wire transfers, or deploying initial-access malware payloads.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-sky-400 block mb-1">Credential Harvesting</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Spoofing trusted authentication portals (e.g. Microsoft 365, Google Workspace, Okta) to capture usernames, passwords, and MFA session tokens.
            </p>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-amber-400 block mb-1">Business Email Compromise (BEC)</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Impersonating senior executives (CEO/CFO) or trusted vendors to manipulate finance personnel into diverting wire transfers or changing direct deposit accounts.
            </p>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-purple-400 block mb-1">Spear Phishing with Malicious Attachments</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Delivering weaponized files with deceptive double extensions (e.g., .pdf.exe) or macro-enabled documents to achieve initial remote code execution.
            </p>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-emerald-400 block mb-1">Smishing & Delivery Scams</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Exploiting parcel tracking habits (DHL, FedEx, USPS) with false customs clearance fees to harvest credit card numbers.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Machine Learning Architecture */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-lg space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          <span>2. Machine Learning Architecture (scikit-learn)</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          The lab bundles a genuine, local Natural Language Processing pipeline built using Python's <code>scikit-learn</code> library. No paid or external cloud AI APIs are used.
        </p>
        <div className="bg-[#090d16] p-4 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
          <div><span className="text-sky-400">Feature Extraction:</span> TF-IDF Vectorizer (sublinear term frequencies, unigrams & bigrams, max 2500 features, English stop words removed).</div>
          <div><span className="text-purple-400">Classifier:</span> L2-Regularized Logistic Regression with balanced class weights (C=2.0).</div>
          <div><span className="text-emerald-400">Cross Validation:</span> 5-Fold Stratified K-Fold cross validation on safe academic dataset (&gt;95% accuracy, 100% precision).</div>
          <div><span className="text-amber-400">Explainability:</span> Dot product of sparse TF-IDF vectors with model weight coefficients identifies the top n-grams driving the verdict.</div>
        </div>
      </div>

      {/* Section 3: Risk Scoring Methodology */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-lg space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2">
          <Scale className="w-4 h-4 text-amber-400" />
          <span>3. Composite Risk Scoring Methodology</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          The investigation platform calculates an explicit, transparent risk score from 0 to 100 rather than relying on an opaque number. The score combines rule-based heuristics (max 75 pts) with the ML probability (max 25 pts).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2 px-3">Indicator Category</th>
                <th className="py-2 px-3">Weight</th>
                <th className="py-2 px-3 font-sans">Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2 px-3 text-rose-400">Credential Request / Harvesting</td>
                <td className="py-2 px-3">+20 pts</td>
                <td className="py-2 px-3 font-sans text-slate-400">Direct solicitation of passwords, seed phrases, or tokens</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-rose-400">Suspicious Destination URL</td>
                <td className="py-2 px-3">+20 pts</td>
                <td className="py-2 px-3 font-sans text-slate-400">Lookalike domain, brand impersonation, or numeric IP host</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-amber-400">SPF / DKIM / DMARC Failures</td>
                <td className="py-2 px-3">+15 pts each</td>
                <td className="py-2 px-3 font-sans text-slate-400">Cryptographic sender authentication check failure</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-amber-400">Sender vs Reply-To Mismatch</td>
                <td className="py-2 px-3">+15 pts</td>
                <td className="py-2 px-3 font-sans text-slate-400">Inbound response rerouted to external attacker infrastructure</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-sky-400">Urgency & Coercive Language</td>
                <td className="py-2 px-3">+12 pts</td>
                <td className="py-2 px-3 font-sans text-slate-400">Artificial countdown or service termination threat</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-purple-400">Machine Learning Phishing Confidence</td>
                <td className="py-2 px-3">Up to +25 pts</td>
                <td className="py-2 px-3 font-sans text-slate-400">ML probability mapped directly into composite total</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs font-mono font-semibold">
          <div className="bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 p-2 rounded">0–24: LOW</div>
          <div className="bg-amber-950/60 border border-amber-600/40 text-amber-300 p-2 rounded">25–49: MEDIUM</div>
          <div className="bg-orange-950/60 border border-orange-600/40 text-orange-300 p-2 rounded">50–74: HIGH</div>
          <div className="bg-rose-950/60 border border-rose-600/40 text-rose-300 p-2 rounded">75–100: CRITICAL</div>
        </div>
      </div>

      {/* Section 4: Investigation Workflow */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-lg space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2">
          <Workflow className="w-4 h-4 text-sky-400" />
          <span>4. SOC Analyst Investigation Workflow</span>
        </h2>
        <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
          <li><strong>Ingest Case:</strong> Paste email body, sender information, and raw RFC headers into New Investigation.</li>
          <li><strong>Automated Triage:</strong> Engine extracts URLs, IOCs, evaluates domain structure, and queries local ML classifier.</li>
          <li><strong>Verify Findings:</strong> Review explainable AI insights to understand why specific signals triggered alerts.</li>
          <li><strong>Evidence & Note Capture:</strong> Record analyst notes, timeline milestones, and correlate with historical IOCs.</li>
          <li><strong>Containment & Response:</strong> Implement recommended defensive actions (blocklist domains, reset passwords, update firewall rules).</li>
          <li><strong>Reporting:</strong> Export formal, audit-ready PDF investigation report for compliance and incident post-mortem.</li>
        </ol>
      </div>

      {/* Section 5: Technical Boundaries & Safety */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-lg space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>5. Operational Safeguards & Technical Boundaries</span>
        </h2>
        <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside leading-relaxed">
          <li><strong>No Malware Execution:</strong> The platform is strictly an investigation and triage laboratory. It does not execute binaries or scripts.</li>
          <li><strong>No Live Hyperlink Clicks:</strong> URLs are analyzed through static regex, lexical decomposition, and domain parsing without making outbound HTTP requests to attacker servers.</li>
          <li><strong>Safe Academic Data:</strong> Bundled demonstration cases use synthetic and defanged domains (e.g. .test, example) to prevent accidental interaction with live threat infrastructure.</li>
        </ul>
      </div>
    </div>
  );
};
