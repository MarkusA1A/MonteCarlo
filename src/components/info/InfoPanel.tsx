import { Lightbulb, TrendingUp, BarChart3, Target, HelpCircle, ChevronRight, AlertTriangle, Scale, Shield, User, Mail, Phone, MapPin, Globe, Award, Link2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';

export function InfoPanel() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Einleitung */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#0066FF]/10 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-[#0066FF]" />
            </div>
            <div>
              <CardTitle>Was ist die Monte-Carlo-Simulation?</CardTitle>
              <CardDescription>Eine einfache Erklärung für Einsteiger</CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="prose prose-sm max-w-none text-gray-600 space-y-4">
          <p>
            Stellen Sie sich vor, Sie möchten den Wert einer Immobilie schätzen. Normalerweise würde man
            einen einzelnen Wert berechnen - zum Beispiel 500.000 Euro. Aber wie sicher ist diese Zahl?
          </p>
          <p>
            Die <strong className="text-gray-900">Monte-Carlo-Simulation</strong> geht einen anderen Weg:
            Statt einer einzigen Berechnung führt sie <strong className="text-gray-900">tausende Berechnungen</strong> durch,
            bei denen die Eingabewerte jeweils leicht variieren - so wie es auch in der Realität der Fall ist.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-[#0066FF] font-medium mb-2">Das Ergebnis:</p>
            <p className="text-gray-700">
              Sie erhalten nicht nur einen Wert, sondern eine <strong>Bandbreite möglicher Werte</strong> mit
              Wahrscheinlichkeiten. So wissen Sie zum Beispiel: "Mit 80% Wahrscheinlichkeit liegt der Wert
              zwischen 450.000 und 550.000 Euro."
            </p>
          </div>
        </div>
      </Card>

      {/* Warum der Name? */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-purple-600" />
            </div>
            <CardTitle className="text-base">Warum "Monte Carlo"?</CardTitle>
          </div>
        </CardHeader>
        <p className="text-gray-600 text-sm">
          Der Name kommt vom berühmten Casino in Monaco. Genau wie beim Glücksspiel spielt der
          <strong className="text-gray-900"> Zufall</strong> eine zentrale Rolle - die Methode "würfelt" sozusagen
          tausende Male mit Ihren Eingabewerten, um alle möglichen Szenarien durchzuspielen.
        </p>
      </Card>

      {/* Wie funktioniert es? */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <CardTitle className="text-base">Wie funktioniert das in dieser App?</CardTitle>
          </div>
        </CardHeader>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-semibold text-gray-600">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Sie geben Ihre Schätzungen ein</p>
              <p className="text-sm text-gray-600">
                Für jeden Parameter (z.B. Mietpreis pro m²) geben Sie nicht nur einen Wert an,
                sondern auch wie sicher Sie sich sind. Das passiert über die Verteilung.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-semibold text-gray-600">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Die App berechnet tausende Szenarien</p>
              <p className="text-sm text-gray-600">
                Bei 10.000 Simulationen wird der Immobilienwert 10.000 Mal berechnet -
                jedes Mal mit leicht anderen Werten innerhalb Ihrer angegebenen Bandbreiten.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-semibold text-gray-600">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Sie erhalten eine fundierte Einschätzung</p>
              <p className="text-sm text-gray-600">
                Das Ergebnis zeigt Ihnen den wahrscheinlichsten Wert und wie stark er schwanken könnte.
                Je breiter die Streuung, desto unsicherer die Bewertung.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Zusammenhänge zwischen Parametern */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Link2 className="w-5 h-5 text-indigo-600" />
            </div>
            <CardTitle className="text-base">Warum hängen die Werte zusammen?</CardTitle>
          </div>
        </CardHeader>

        <div className="space-y-4 text-sm text-gray-600">
          <p>
            In der Realität passieren gute und schlechte Dinge oft gemeinsam. Eine Immobilie in Top-Lage
            hat nicht nur hohe Mieten, sondern auch wenig Leerstand. Diese App berücksichtigt solche
            <strong className="text-gray-900"> Zusammenhänge</strong> automatisch - das macht die Ergebnisse realistischer.
          </p>

          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <h4 className="font-medium text-indigo-900 mb-3">Beispiele aus der Praxis</h4>
            <ul className="space-y-3 text-xs text-indigo-800">
              <li>
                <strong className="text-indigo-900">Gute Lage = wenig Leerstand:</strong> Wenn die Mieten hoch sind,
                ist die Lage meist attraktiv - und attraktive Lagen haben wenig Leerstand.
                Die Simulation berücksichtigt: Hohe Miete und hoher Leerstand gleichzeitig ist unwahrscheinlich.
              </li>
              <li>
                <strong className="text-indigo-900">Risiko hängt zusammen:</strong> Wenn viele Wohnungen leer stehen,
                sehen Käufer mehr Risiko und erwarten höhere Renditen. Umgekehrt akzeptieren sie bei voll vermieteten
                Objekten niedrigere Renditen.
              </li>
              <li>
                <strong className="text-indigo-900">Vernachlässigung zeigt sich überall:</strong> Ein Gebäude mit
                hohem Leerstand hat oft auch höheren Sanierungsbedarf - beides sind Zeichen von Vernachlässigung.
              </li>
            </ul>
          </div>

          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <h4 className="font-medium text-red-900 mb-2">Was passiert in einer Krise?</h4>
            <p className="text-xs text-red-800">
              Die Simulation berücksichtigt auch <strong>Extremszenarien</strong>: In den schlimmsten 5% der
              simulierten Fälle (sehr hohe Renditeerwartungen der Käufer = Krisenstimmung) wird der Leerstand
              zusätzlich erhöht. Das bildet ab, was in echten Krisen passiert: Mehrere negative Faktoren
              treten gleichzeitig auf und verstärken sich gegenseitig.
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-xs text-green-800">
              <strong className="text-green-900">Was bedeutet das für Sie?</strong> Die Ergebnisse dieser Simulation
              sind realistischer als einfache Berechnungen, weil sie berücksichtigen, dass in guten Zeiten
              vieles gut läuft - und in schlechten Zeiten vieles gleichzeitig schlecht wird.
            </p>
          </div>
        </div>
      </Card>

      {/* Die drei Bewertungsmethoden */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <CardTitle className="text-base">Die drei Bewertungsmethoden</CardTitle>
          </div>
        </CardHeader>

        <div className="space-y-4">
          <MethodExplanation
            color="blue"
            title="Ertragswertverfahren"
            description="Bewertet die Immobilie anhand der Mieteinnahmen. Frage: Wie viel Miete kann ich erwarten und was ist das wert?"
            example="Beispiel: 15 Euro/m2 Miete x 100 m2 x 12 Monate = 18.000 Euro/Jahr. Bei 4% Kapitalisierung = 450.000 Euro Wert."
          />

          <MethodExplanation
            color="purple"
            title="Vergleichswertverfahren"
            description="Vergleicht mit ähnlichen Immobilien in der Umgebung. Frage: Was würden andere für eine vergleichbare Immobilie zahlen?"
            example="Beispiel: Ähnliche Wohnungen kosten 5.000 Euro/m². Bei 100 m² und guter Lage (Faktor 1,1) = 550.000 Euro."
          />

          <MethodExplanation
            color="green"
            title="DCF-Modell (Discounted Cash Flow)"
            description="Betrachtet alle zukünftigen Einnahmen und rechnet sie auf heute zurück. Frage: Was sind alle zukünftigen Mieten heute wert?"
            example="Beispiel: 10 Jahre Mieteinnahmen abzüglich Kosten plus Verkaufserlös, auf den heutigen Wert abgezinst."
          />
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong className="text-gray-900">Tipp:</strong> Diese App kombiniert alle aktivierten Methoden
            zu einem Gesamtwert. So erhalten Sie eine ausgewogenere Schätzung als bei nur einer Methode.
          </p>
        </div>
      </Card>

      {/* Die Ergebnisse verstehen */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-rose-600" />
            </div>
            <CardTitle className="text-base">Die Ergebnisse richtig lesen</CardTitle>
          </div>
        </CardHeader>

        <div className="space-y-3 text-sm">
          <ResultExplanation
            term="Mittelwert"
            description="Der Durchschnitt aller berechneten Werte. Kann durch einzelne sehr hohe oder niedrige Ausreißer verzerrt werden."
          />
          <ResultExplanation
            term="Median"
            description="Der mittlere Wert, wenn alle Ergebnisse sortiert werden (50% darunter, 50% darüber). Robust gegenüber Ausreißern – zeigt den 'typischen' Wert."
          />
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 text-xs">
            <p className="font-medium text-purple-900 mb-1">Mittelwert vs. Median – wann welchen nutzen?</p>
            <p className="text-purple-800">
              Sind beide ähnlich, ist die Verteilung symmetrisch und beide Werte aussagekräftig.
              Liegt der <strong>Mittelwert über dem Median</strong>, gibt es hohe Ausreißer – der Median ist dann konservativer.
              Liegt der <strong>Mittelwert unter dem Median</strong>, gibt es niedrige Ausreißer.
              Für eine <strong>vorsichtige Schätzung</strong> empfiehlt sich oft der Median.
            </p>
          </div>
          <ResultExplanation
            term="P10 / P90 (Perzentile)"
            description="P10 bedeutet: 10% der Werte liegen darunter (pessimistisch). P90 bedeutet: 90% liegen darunter (optimistisch)."
          />
          <ResultExplanation
            term="Standardabweichung"
            description="Zeigt, wie stark die Werte streuen. Hohe Streuung = hohe Unsicherheit."
          />
          <ResultExplanation
            term="Variationskoeffizient"
            description="Die relative Streuung in Prozent (Standardabweichung / Mittelwert). Unter 10% = geringe, 10-20% = moderate, über 20% = hohe Unsicherheit."
          />
          <ResultExplanation
            term="Histogramm"
            description="Das Balkendiagramm zeigt, wie häufig welche Werte vorkommen. Die höchsten Balken zeigen die wahrscheinlichsten Werte."
          />
          <ResultExplanation
            term="Sensitivitätsanalyse"
            description="Zeigt, welche Eingabeparameter den größten Einfluss auf das Ergebnis haben."
          />
        </div>
      </Card>

      {/* Tipps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tipps für bessere Ergebnisse</CardTitle>
        </CardHeader>

        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start space-x-2">
            <ChevronRight className="w-4 h-4 text-[#0066FF] flex-shrink-0 mt-0.5" />
            <span>Seien Sie bei den Bandbreiten realistisch - zu enge Bereiche unterschätzen das Risiko.</span>
          </li>
          <li className="flex items-start space-x-2">
            <ChevronRight className="w-4 h-4 text-[#0066FF] flex-shrink-0 mt-0.5" />
            <span>Nutzen Sie verschiedene Verteilungstypen: "Dreieck" wenn Sie Min/Max/Wahrscheinlichstes kennen, "Normal" bei symmetrischer Unsicherheit.</span>
          </li>
          <li className="flex items-start space-x-2">
            <ChevronRight className="w-4 h-4 text-[#0066FF] flex-shrink-0 mt-0.5" />
            <span>10.000 Simulationen sind ein guter Kompromiss zwischen Genauigkeit und Geschwindigkeit.</span>
          </li>
          <li className="flex items-start space-x-2">
            <ChevronRight className="w-4 h-4 text-[#0066FF] flex-shrink-0 mt-0.5" />
            <span>Aktivieren Sie mehrere Bewertungsmethoden für eine robustere Schätzung.</span>
          </li>
        </ul>
      </Card>

      {/* Disclaimer */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-base text-amber-900">Rechtlicher Hinweis (Disclaimer)</CardTitle>
              <CardDescription className="text-amber-700">Bitte lesen Sie diese Hinweise sorgfältig</CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="space-y-4 text-sm">
          {/* Haftungsausschluss */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-amber-600" />
              <h4 className="font-semibold text-gray-900">Haftungsausschluss</h4>
            </div>
            <p className="text-gray-600">
              Der Autor übernimmt <strong className="text-gray-900">keine Gewähr</strong> für die Richtigkeit,
              Vollständigkeit oder Aktualität der Berechnungen. Die Nutzung dieser Software erfolgt auf
              <strong className="text-gray-900"> eigenes Risiko</strong>. Es wird keine Haftung für etwaige
              Fehler in den Berechnungen oder daraus resultierende finanzielle Verluste übernommen.
            </p>
          </div>

          {/* Monte-Carlo spezifisch */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-amber-600" />
              <h4 className="font-semibold text-gray-900">Besonderheiten der Monte-Carlo-Simulation</h4>
            </div>
            <p className="text-gray-600">
              Die Monte-Carlo-Simulation liefert <strong className="text-gray-900">statistische Wahrscheinlichkeiten</strong>,
              keine garantierten Werte. Die Qualität der Ergebnisse hängt maßgeblich von der
              <strong className="text-gray-900"> Qualität der Eingabedaten</strong> ab. Unrealistische Annahmen
              führen zu unrealistischen Ergebnissen ("Garbage In, Garbage Out").
            </p>
            <p className="text-gray-600">
              Die angezeigten Bandbreiten und Wahrscheinlichkeiten basieren auf den von Ihnen gewählten
              Verteilungen und stellen <strong className="text-gray-900">keine Prognose tatsächlicher Marktentwicklungen</strong> dar.
            </p>
          </div>

          {/* Qualifikation */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-amber-600" />
              <h4 className="font-semibold text-gray-900">Kein Ersatz für Sachverständigengutachten</h4>
            </div>
            <p className="text-gray-600">
              Diese Software <strong className="text-gray-900">ersetzt kein professionelles Wertgutachten</strong>.
              Für rechtlich verbindliche Bewertungen (z.B. für Finanzierungen, Erbschaften, Scheidungen oder
              gerichtliche Verfahren) sollten Sie einen beeideten Sachverständigen, Ziviltechniker oder
              MRICS-zertifizierten Bewerter beauftragen.
            </p>
            <p className="text-gray-600">
              Die Anwendung dieser Software setzt <strong className="text-gray-900">grundlegende Kenntnisse</strong> der
              Immobilienbewertung voraus. Der Anwender trägt die volle Verantwortung für die Interpretation
              und Verwendung der Ergebnisse.
            </p>
          </div>

          {/* Rechtliches */}
          <div className="bg-amber-100/50 rounded-lg p-3 border border-amber-200">
            <p className="text-xs text-amber-800">
              <strong>Anwendbares Recht:</strong> Österreichisches Recht | <strong>Gerichtsstand:</strong> Graz |
              <strong> Kontakt:</strong> Allgemein beeideter und gerichtlich zertifizierter Sachverständiger Markus Thalhamer
            </p>
          </div>

          {/* Zustimmung */}
          <p className="text-xs text-gray-500 italic">
            Durch die Nutzung dieser Software erklären Sie sich mit den oben genannten Bedingungen einverstanden.
          </p>
        </div>
      </Card>

      {/* Impressum */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-base">Impressum</CardTitle>
              <CardDescription>Angaben gemäß § 5 ECG</CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="space-y-4 text-sm">
          {/* Betreiber */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Diensteanbieter</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start space-x-2">
                <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Markus Thalhamer, MSc MRICS</p>
                  <p className="text-gray-500 text-xs">Allgemein beeideter und gerichtlich zertifizierter Sachverständiger</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-600">Morellenfeldgasse 13</p>
                  <p className="text-gray-600">8010 Graz, Steiermark</p>
                  <p className="text-gray-600">Österreich</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kontakt */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Kontakt</h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href="tel:+436643021083"
                className="flex items-center space-x-2 text-gray-600 hover:text-[#0066FF] transition-colors"
              >
                <Phone className="w-4 h-4 text-gray-400" />
                <span>+43 664 302 10 83</span>
              </a>

              <a
                href="mailto:mthalhamer@thalhamer.com"
                className="flex items-center space-x-2 text-gray-600 hover:text-[#0066FF] transition-colors"
              >
                <Mail className="w-4 h-4 text-gray-400" />
                <span>mthalhamer@thalhamer.com</span>
              </a>

              <a
                href="https://www.immobilienwerte.at"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-600 hover:text-[#0066FF] transition-colors"
              >
                <Globe className="w-4 h-4 text-gray-400" />
                <span>www.immobilienwerte.at</span>
              </a>
            </div>
          </div>

          {/* Berufsbezeichnung */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Berufsbezeichnung & Qualifikationen</h4>

            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Award className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-600">
                    <strong className="text-gray-900">Allgemein beeideter und gerichtlich zertifizierter Sachverständiger</strong>
                  </p>
                  <p className="text-gray-500 text-xs">Fachgebiet: Immobilienbewertung</p>
                  <p className="text-gray-500 text-xs">Eintragung: Landesgericht für Zivilrechtssachen Graz</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Award className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-600">
                    <strong className="text-gray-900">MRICS</strong> - Member of the Royal Institution of Chartered Surveyors
                  </p>
                  <p className="text-gray-500 text-xs">Internationale Berufsorganisation für Immobilienfachleute</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rechtliche Hinweise */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2">
            <p className="text-xs text-gray-600">
              <strong className="text-gray-900">Anwendbares Recht:</strong> Österreichisches Recht
            </p>
            <p className="text-xs text-gray-600">
              <strong className="text-gray-900">Gerichtsstand:</strong> Graz
            </p>
            <p className="text-xs text-gray-600">
              <strong className="text-gray-900">Berufsrecht:</strong> Sachverständigen- und Dolmetschergesetz (SDG)
            </p>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
            © {new Date().getFullYear()} Markus Thalhamer. Alle Rechte vorbehalten.
          </p>
        </div>
      </Card>
    </div>
  );
}

function MethodExplanation({
  color,
  title,
  description,
  example,
}: {
  color: 'blue' | 'purple' | 'green';
  title: string;
  description: string;
  example: string;
}) {
  const colors = {
    blue: 'border-[#0066FF] bg-blue-50',
    purple: 'border-purple-500 bg-purple-50',
    green: 'border-green-500 bg-green-50',
  };

  return (
    <div className={`border-l-4 ${colors[color]} rounded-r-lg p-3`}>
      <p className="font-medium text-gray-900 text-sm">{title}</p>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
      <p className="text-xs text-gray-500 mt-2 italic">{example}</p>
    </div>
  );
}

function ResultExplanation({ term, description }: { term: string; description: string }) {
  return (
    <div className="flex">
      <span className="font-medium text-gray-900 w-40 flex-shrink-0">{term}:</span>
      <span className="text-gray-600">{description}</span>
    </div>
  );
}
