import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Users, Eye, Clock, CheckCircle, AlertCircle } from "lucide-react";

const Rules = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-dark">
      <Header />

      <main className="flex-1 pt-24 md:pt-28 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Page Header */}
          <div className="text-center mb-12 animate-slide-up">
            <h1 className="font-display text-4xl md:text-5xl tracking-wide mb-4">
              RULES & <span className="text-gradient-gold">TRANSPARENCY</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We are committed to ensuring fair, transparent, and secure voting for the Addis Games Week Awards.
            </p>
          </div>

          {/* Voting Rules */}
          <section className="mb-12 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h2 className="font-display text-2xl tracking-wide mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              VOTING RULES
            </h2>
            <div className="bg-gradient-card border border-border/50 rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">One Vote Per Category</h3>
                  <p className="text-sm text-muted-foreground">
                    Each voter can submit only one vote per award category. You may change your vote until the voting deadline.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Voter Verification Required</h3>
                  <p className="text-sm text-muted-foreground">
                    To ensure vote integrity, voters must verify their identity through email, phone number, or Telegram login.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Voting Period</h3>
                  <p className="text-sm text-muted-foreground">
                    Voting opens on December 15, 2024 and closes on January 31, 2025 at 11:59 PM EAT.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Eligibility</h3>
                  <p className="text-sm text-muted-foreground">
                    Voting is open to all individuals. There are no geographic restrictions.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Anti-Fraud Measures */}
          <section className="mb-12 animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <h2 className="font-display text-2xl tracking-wide mb-6 flex items-center gap-3">
              <Eye className="w-6 h-6 text-primary" />
              ANTI-FRAUD MEASURES
            </h2>
            <div className="bg-gradient-card border border-border/50 rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Bot Prevention</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced CAPTCHA systems prevent automated voting attempts.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Rate Limiting</h3>
                  <p className="text-sm text-muted-foreground">
                    IP-based and device-based rate limiting prevents vote flooding from single sources.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Real-Time Monitoring</h3>
                  <p className="text-sm text-muted-foreground">
                    Our team monitors voting patterns to detect and investigate suspicious activity.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Vote Verification</h3>
                  <p className="text-sm text-muted-foreground">
                    Addis Games Week reserves the right to verify and audit votes before announcing final results.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Transparency */}
          <section className="mb-12 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="font-display text-2xl tracking-wide mb-6 flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              TRANSPARENCY
            </h2>
            <div className="bg-gradient-card border border-border/50 rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">No Live Vote Counts</h3>
                  <p className="text-sm text-muted-foreground">
                    To prevent strategic voting, live vote counts are not displayed during the voting period.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Public vs Jury Weighting</h3>
                  <p className="text-sm text-muted-foreground">
                    Public votes account for 70% of the final score, while an expert jury panel contributes 30%.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Results Announcement</h3>
                  <p className="text-sm text-muted-foreground">
                    Winners will be announced at the Addis Games Week Award Ceremony in February 2025.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Privacy Notice */}
          <section className="mb-12 animate-slide-up" style={{ animationDelay: "0.25s" }}>
            <h2 className="font-display text-2xl tracking-wide mb-6 flex items-center gap-3">
              <Clock className="w-6 h-6 text-primary" />
              PRIVACY NOTICE
            </h2>
            <div className="bg-gradient-card border border-border/50 rounded-xl p-6">
              <p className="text-muted-foreground mb-4">
                Your privacy matters to us. Here's how we handle your data:
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Voter information is used solely for vote verification and fraud prevention.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  We do not sell or share personal data with third parties for marketing purposes.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  All data is securely encrypted and stored in compliance with data protection standards.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Vote data will be retained for audit purposes and deleted 90 days after the award ceremony.
                </li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 text-center">
              <h3 className="font-display text-xl tracking-wide mb-2">Questions or Concerns?</h3>
              <p className="text-muted-foreground mb-4">
                If you have any questions about the voting process, please contact us at:
              </p>
              <a
                href="mailto:awards@addisgamesweek.com"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                awards@addisgamesweek.com
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Rules;
