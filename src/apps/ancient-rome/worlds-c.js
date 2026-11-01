// Worlds 7 and 8: historical sources and the written judgement (Beurteilung).

const W_SOURCES = {
  id: 'quellen', img: 'img/quellen.webp', title: 'Historische Quellen', sub: 'Woran du erkennst, ob etwas eine Quelle ist', art: 'tablet', badge: 'Geschichtsdetektiv',
  learn: [
    { h: 'Was ist eine historische Quelle?', p: 'Eine historische Quelle ist alles, was <b>aus der Zeit stammt, um die es geht</b>, und uns etwas über diese Zeit verrät: Texte, Gegenstände, Bilder oder Bauwerke. Quellen haben Menschen damals hinterlassen, und aus ihnen gewinnen Historiker ihr Wissen über die Vergangenheit.' },
    { h: 'So prüfst du, ob etwas eine Quelle ist', steps: ['<b>Wann</b> ist es entstanden? Stammt es aus der Zeit, über die es etwas aussagt?', '<b>Wer</b> hat es gemacht oder geschrieben? Ein Mensch, der damals gelebt hat (ein Zeitgenosse)?', '<b>Ist es überliefert</b>, also aus der Zeit erhalten geblieben, und nicht später ausgedacht oder nachgebaut?', 'Gilt das alles, ist es eine Quelle. Wurde es erst viel später über die Vergangenheit verfasst, ist es eine <b>Darstellung</b>.'] },
    { h: 'Arten von Quellen', list: [
      { t: 'Schriftquellen (Textquellen)', d: 'Briefe, Berichte, Gesetze, Inschriften, z. B. Ciceros Text über die Berufe oder Senecas Brief über das Bad' },
      { t: 'Sachquellen', d: 'Gegenstände und Bauwerke, z. B. Münzen, Öllampen, Tonspielzeug, Statuen, das Kolosseum' },
      { t: 'Bildquellen', d: 'Bilder aus der Zeit, z. B. Wandmalereien, Reliefs, Mosaike' },
      { t: 'mündliche Quellen', d: 'Erzählungen von Zeitzeugen, die selbst dabei waren' },
    ] },
    { h: 'Quelle oder Darstellung?', table: { head: ['', 'Quelle', 'Darstellung'], rows: [
      ['Entstehung', 'in der Zeit, um die es geht', 'später, oft heute'],
      ['Verfasser', 'Menschen von damals', 'Historiker, Schulbuchautoren, Zeichner'],
      ['Beispiele', 'römische Münze aus dem 2. Jh. v. Chr., Ciceros Text, Statue eines Römers', 'Schulbuchtext, Rekonstruktionszeichnung, Schaubild, Zeitreise-Geschichte, Film'],
    ] } },
    { h: 'Vorsicht, Falle!', bullets: ['Ein Text <b>über</b> die Römer ist nicht automatisch eine Quelle. Der Autorentext im Schulbuch ist eine Darstellung, weil er heute geschrieben wurde.', 'Die Kapitolinische Wölfin sieht alt aus, stammt aber aus dem Mittelalter. Für die Gründung Roms ist sie deshalb keine Quelle aus der Zeit.', 'Die „Zeitreise“ mit Julia und ihrem Großvater ist ausgedacht und damit eine Darstellung, auch wenn sie spannend erzählt ist.'] },
  ],
  levels: [
    { type: 'learn', title: 'Wissen: Quellen' },
    { type: 'swipe', title: 'Quelle oder nicht?', prompt: 'Ist das eine historische Quelle zum alten Rom?', yes: 'Quelle', no: 'Darstellung', items: [
      { t: 'eine römische Münze aus dem 2. Jahrhundert v. Chr. mit der Wölfin', ok: true, x: 'Sachquelle aus der Zeit.' },
      { t: 'der Text von Cicero (106 bis 43 v. Chr.) über die Berufe seiner Zeit', ok: true, x: 'Schriftquelle eines Zeitgenossen.' },
      { t: 'der Brief von Seneca über den Lärm im Bad unter seiner Wohnung', ok: true, x: 'Schriftquelle, Seneca hat es selbst erlebt.' },
      { t: 'der Autorentext im Geschichtsbuch über die Ursprünge Roms', ok: false, x: 'Darstellung, heute von Schulbuchautoren geschrieben.' },
      { t: 'die Rekonstruktionszeichnung der Landschaft, in der Rom entstand', ok: false, x: 'Darstellung, heute nach Funden gezeichnet.' },
      { t: 'eine Öllampe aus Ton mit einem Gladiator darauf, gefunden bei Ausgrabungen', ok: true, x: 'Sachquelle (und Bildquelle) aus der Römerzeit.' },
      { t: 'die Zeitreise-Geschichte mit Julia und ihrem Großvater', ok: false, x: 'Ausgedacht und heute geschrieben, also eine Darstellung.' },
      { t: 'das Schaubild zur „Verfassung“ der römischen Republik vom Arbeitsblatt', ok: false, x: 'Darstellung, heute zum Lernen gezeichnet.' },
      { t: 'eine Statue eines Römers mit den Büsten seiner Vorfahren (um Christi Geburt)', ok: true, x: 'Sachquelle aus der Zeit.' },
      { t: 'ein Spielfilm über Gladiatoren', ok: false, x: 'Darstellung, heute gedreht.' },
      { t: 'das Kolosseum in Rom', ok: true, x: 'Ein Bauwerk aus der Zeit ist eine Sachquelle.' },
      { t: 'ein Relief aus dem 3. Jahrhundert n. Chr., das einen Vater bei der Erziehung zeigt', ok: true, x: 'Bildquelle aus der Römerzeit.' },
      { t: 'ein Modell eines Dorfes auf dem Palatin im Museum', ok: false, x: 'Das Modell wurde heute nach Funden gebaut, es ist eine Darstellung.' },
      { t: 'eine Inschrift auf einem römischen Grabstein', ok: true, x: 'Schriftquelle aus der Zeit.' },
    ] },
    { type: 'sort', title: 'Welche Quellenart?', prompt: 'Zu welcher Quellenart gehört das?', buckets: ['Schriftquelle', 'Sachquelle', 'Bildquelle'], items: [
      { t: 'Brief von Seneca', b: 0 }, { t: 'Ciceros Text über Berufe', b: 0 }, { t: 'Inschrift auf einem Grabstein', b: 0 }, { t: 'Bericht eines römischen Geschichtsschreibers', b: 0 },
      { t: 'römische Münze', b: 1 }, { t: 'Tonspielzeug', b: 1 }, { t: 'Werkzeug aus Bronze', b: 1 }, { t: 'Amphore', b: 1 },
      { t: 'Wandmalerei aus Pompeji', b: 2 }, { t: 'Mosaik mit Gladiatoren', b: 2 }, { t: 'Relief mit einer Familienszene', b: 2 },
    ] },
    { type: 'mix', title: 'Quellen-Check', items: [
      { q: 'Was ist das wichtigste Merkmal einer historischen Quelle?', o: ['Sie stammt aus der Zeit, um die es geht.', 'Sie steht in einem Schulbuch.', 'Sie ist besonders spannend geschrieben.', 'Sie wurde von einem Historiker verfasst.'], a: 0, x: 'Quellen stammen aus der Zeit selbst, Darstellungen entstehen später.' },
      { q: 'Wie nennt man einen Text, den ein Historiker heute über die Römer schreibt?', o: ['Darstellung', 'Quelle', 'Sachquelle', 'Mythos'], a: 0, x: 'Er beruht auf Quellen, ist aber selbst keine.' },
      { q: 'Welche Fragen helfen dir zu prüfen, ob ein Text eine Quelle ist?', kind: 'multi', o: ['Wann ist er entstanden?', 'Wer hat ihn geschrieben?', 'Stammt er aus der Zeit, über die er berichtet?', 'Ist er lang genug?', 'Hat er Bilder?'], right: [0, 1, 2], x: 'Länge und Bilder sagen nichts darüber, ob es eine Quelle ist.' },
      { q: 'Die Kapitolinische Wölfin wurde im Mittelalter geschaffen. Ist sie eine Quelle für die Gründung Roms 753 v. Chr.?', o: ['Nein, sie ist viel später entstanden.', 'Ja, weil sie die Wölfin zeigt.', 'Ja, weil sie aus Bronze ist.', 'Ja, weil sie im Museum steht.'], a: 0, x: 'Sie stammt nicht aus der Zeit der Gründung.' },
      { q: 'Ein Archäologe findet eine Öllampe aus der Römerzeit. Was für eine Quelle ist das?', o: ['eine Sachquelle', 'eine Schriftquelle', 'eine Darstellung', 'eine mündliche Quelle'], a: 0, x: 'Gegenstände sind Sachquellen.' },
      { q: 'Woher wissen Historiker, dass es auf dem Palatin seit 1000 v. Chr. Hütten gab?', o: ['aus archäologischen Funden, z. B. Löchern in Felsplatten', 'aus der Sage von der Wölfin', 'aus einem Spielfilm', 'aus dem Schulbuch'], a: 0, x: 'Funde und schriftliche Quellen sind die Grundlage der Forschung.' },
    ] },
    { type: 'write', title: 'Klassenarbeits-Training', items: [
      { q: 'Erkläre, woran du erkennst, ob ein Text eine historische Quelle ist.', points: ['Quelle stammt aus der Zeit, um die es geht', 'verfasst von einem Menschen dieser Zeit (Zeitgenosse)', 'Prüffragen: Wann? Wer? Aus der Zeit überliefert?', 'Gegenteil: Darstellung, später verfasst (z. B. Schulbuchtext)', 'Beispiel nennen'],
        m: 'Eine historische Quelle stammt aus der Zeit, um die es geht. Um das zu prüfen, frage ich, wann der Text entstanden ist und wer ihn geschrieben hat. Hat ihn ein Mensch verfasst, der damals gelebt hat, und ist er aus dieser Zeit überliefert, ist er eine Quelle, z. B. Ciceros Text über die Berufe seiner Zeit. Wurde der Text erst später über die Vergangenheit geschrieben, wie der Autorentext im Schulbuch, ist er keine Quelle, sondern eine Darstellung.' },
      { q: 'Prüfe, ob der Brief von Seneca über die Thermen und die Zeitreise-Geschichte mit Julia und ihrem Großvater Quellen sind. Begründe.', points: ['Seneca lebte ungefähr 1 bis 65 n. Chr., also zur Römerzeit', 'er schreibt über eigene Erlebnisse, darum Quelle (Schriftquelle)', 'die Zeitreise ist heute für das Schulbuch ausgedacht', 'darum keine Quelle, sondern eine Darstellung'],
        m: 'Der Brief von Seneca ist eine Quelle, denn Seneca lebte ungefähr von 1 bis 65 n. Chr. und schreibt über das, was er selbst über dem Bad gehört hat. Es ist also eine Schriftquelle aus der Zeit. Die Zeitreise mit Julia und ihrem Großvater wurde dagegen heute für das Schulbuch ausgedacht. Sie erzählt zwar von den Römern, ist aber keine Quelle, sondern eine Darstellung.' },
    ] },
  ],
};

const W_JUDGEMENT = {
  id: 'urteil', img: 'img/urteil.webp', title: 'Die schriftliche Beurteilung', sub: 'Beide Seiten abwägen und sich begründet entscheiden', art: 'tablet', badge: 'Richter',
  learn: [
    { h: 'Was ist eine Beurteilung?', p: 'Bei einer schriftlichen Beurteilung (auch „Stellung nehmen“) bildest du dir zu einer Frage eine eigene Meinung. Wichtig sind zwei Dinge: Du berücksichtigst <b>beide Seiten</b> zu der Frage und entscheidest dich am Ende <b>eindeutig und begründet</b> für eine der Seiten.' },
    { h: 'So baust du sie auf', steps: ['<b>Einleitung</b>: Frage oder Aussage nennen und kurz sagen, worum es geht.', '<b>Die eine Seite</b>: Argumente, die dafür sprechen, jeweils mit Begründung oder Beispiel.', '<b>Die andere Seite</b>: Argumente, die dagegen sprechen, ebenfalls begründet.', '<b>Urteil</b>: Entscheide dich eindeutig für eine Seite und begründe, warum diese Argumente für dich schwerer wiegen.'] },
    { h: 'Hilfreiche Satzanfänge', bullets: ['„Dafür spricht, dass …, weil …“', '„Einerseits …, andererseits …“', '„Dagegen spricht, dass …“', '„Außerdem …“ / „Ein weiteres Argument ist …“', '„Wägt man die Argumente ab, …“', '„Ich komme zu dem Urteil, dass …, weil …“'] },
    { h: 'Typische Fehler', bullets: ['nur eine Seite betrachten', 'kein klares Urteil, z. B. „Es ist teils gut, teils schlecht.“', 'ein Urteil ohne Begründung', 'Argumente ohne Beispiel aus dem Unterricht'] },
    { h: 'Damals und heute', p: 'Du darfst mit deinen eigenen Werten urteilen, etwa mit der Würde jedes Menschen, der Gleichberechtigung oder der Gerechtigkeit. Zeige aber auch, wie die Römer selbst darüber dachten. So berücksichtigst du beide Seiten.' },
  ],
  levels: [
    { type: 'learn', title: 'Wissen: So beurteilst du' },
    { type: 'order', title: 'Der Aufbau', prompt: 'Tippe die Teile einer Beurteilung in der richtigen Reihenfolge an.', items: ['Frage nennen und kurz einleiten', 'Argumente der einen Seite mit Begründung', 'Argumente der anderen Seite mit Begründung', 'eindeutiges Urteil mit Begründung'] },
    { type: 'sort', title: 'Gladiatorenkämpfe: dafür oder dagegen?', prompt: '„Gladiatorenkämpfe – ein unmenschliches Vergnügen?“ Spricht das Argument dafür, dass sie unmenschlich waren, oder dagegen?', buckets: ['unmenschlich', 'aus römischer Sicht vertretbar'], items: [
      { t: 'Menschen kämpften auf Leben und Tod zur Unterhaltung anderer.', b: 0 },
      { t: 'Viele Gladiatoren waren Sklaven und Gefangene, die gezwungen wurden.', b: 0 },
      { t: 'Das Publikum entschied mit Sprechchören über Leben und Tod.', b: 0 },
      { t: 'Wilde Tiere wurden bei Tierhetzen gequält und getötet.', b: 0 },
      { t: 'Manche freien Bürger wurden freiwillig Gladiator, um reich und berühmt zu werden.', b: 1 },
      { t: 'Die Spiele hielten die Einwohner bei Laune („Brot und Spiele“).', b: 1 },
      { t: 'Das Publikum wollte vor allem einen hochwertigen Kampf tapferer Gegner sehen.', b: 1 },
      { t: 'Gladiatoren waren Berufskämpfer mit Ausrüstung und Training.', b: 1 },
    ] },
    { type: 'mix', title: 'Gute Urteile erkennen', items: [
      { q: 'Welcher Schluss ist ein gutes Urteil?', o: ['„Ich komme zu dem Urteil, dass die Kämpfe unmenschlich waren, weil Menschen gezwungen wurden, für die Unterhaltung anderer zu sterben.“', '„Die Kämpfe waren teils gut, teils schlecht.“', '„Ich finde Gladiatoren cool.“', '„Das muss jeder selbst wissen.“'], a: 0, x: 'Ein gutes Urteil ist eindeutig und begründet.' },
      { q: 'Was fehlt in diesem Urteil? „Die Macht des Pater familias war falsch.“', o: ['die Begründung', 'die Jahreszahl', 'ein lateinisches Wort', 'nichts'], a: 0, x: 'Zum Beispiel: „…, weil Frauen, Kinder und Sklaven keine eigenen Rechte hatten.“' },
      { q: 'Was gehört zu einer guten Beurteilung?', kind: 'multi', o: ['beide Seiten berücksichtigen', 'sich eindeutig entscheiden', 'die Entscheidung begründen', 'Beispiele aus dem Unterricht nennen', 'nur die eigene Seite darstellen', 'am Ende offenlassen, was man denkt'], right: [0, 1, 2, 3], x: 'Beide Seiten abwägen und dann klar und begründet entscheiden.' },
      { q: 'Welcher Satzanfang leitet das Gegenargument ein?', o: ['„Dagegen spricht, dass …“', '„Ich komme zu dem Urteil …“', '„In der Frage geht es um …“', '„Zusammenfassend …“'], a: 0, x: 'Damit zeigst du die andere Seite.' },
      { q: '„Beamte in Rom bekamen kein Geld.“ Welches Argument spricht dagegen, dass das eine gute Regel war?', o: ['Nur Reiche konnten sich ein Amt leisten, ärmere Plebejer kaum.', 'Rom sparte dadurch Geld.', 'Die Beamten arbeiteten für die Ehre.', 'Es gab dann weniger Streit.'], a: 0, x: 'So waren die Ämter in der Hand der Reichen.' },
    ] },
    { type: 'write', title: 'Beurteilungen schreiben', items: [
      { q: 'Nimm begründet Stellung zu folgender Frage: „Gladiatorenkämpfe – ein unmenschliches Vergnügen?“', points: ['Einleitung mit der Frage', 'Argument für „unmenschlich“ (z. B. Kampf auf Leben und Tod, gezwungene Sklaven, Publikum entscheidet über den Tod)', 'Argument der anderen Seite (z. B. manche freiwillig für Ruhm und Reichtum, Brot und Spiele, Berufskämpfer)', 'eindeutiges Urteil', 'Begründung des Urteils'],
        m: 'In der Frage geht es darum, ob die Gladiatorenkämpfe im alten Rom unmenschlich waren. Dafür spricht, dass Menschen zur Unterhaltung anderer auf Leben und Tod kämpften. Viele von ihnen waren Sklaven oder Gefangene, die dazu gezwungen wurden, und am Ende entschied das Publikum mit Sprechchören über ihr Leben. Andererseits wurden manche freien Bürger freiwillig Gladiator, weil sie reich und berühmt werden wollten, und für die Römer gehörten die Spiele wie „Brot und Spiele“ zum Leben dazu. Wägt man die Argumente ab, komme ich zu dem Urteil, dass die Kämpfe ein unmenschliches Vergnügen waren, weil das Leben eines Menschen nie zur Unterhaltung aufs Spiel gesetzt werden darf.' },
      { q: 'Nimm Stellung zur Sicht Ciceros auf römische Berufe und vergleiche sie mit deiner heutigen Sicht, indem du Gründe für deine eigene Berufswahl nennst.', points: ['Ciceros Sicht wiedergeben (Landwirtschaft, Arzt, Architekt ehrenvoll, Handwerker, Krämer, Fischer niedrig)', 'Argument, was an seiner Sicht nachvollziehbar ist (z. B. Nutzen für viele)', 'Argument dagegen (z. B. Handwerker und Köche sind heute wichtig, Sicht eines Reichen)', 'eigener Berufswunsch mit Gründen', 'eindeutiges, begründetes Urteil'],
        m: 'Cicero hielt Berufe wie Landwirt, Arzt oder Architekt für ehrenvoll, weil sie auf Wissen beruhen oder vielen Menschen nützen, Handwerker, Krämer und Fischer dagegen für niedrig. Nachvollziehbar finde ich, dass er auf den Nutzen für die Gesellschaft achtet. Dagegen spricht, dass auch Handwerker, Köche und Fischer sehr wichtig sind, denn ohne sie hätte niemand Häuser, Werkzeuge oder Essen. Cicero urteilt außerdem aus der Sicht eines reichen Mannes. Ich möchte später Ingenieur werden, weil ich gern tüftle und etwas Nützliches bauen will. Deshalb komme ich zu dem Urteil, dass Ciceros Sicht heute nicht mehr passt, weil jeder ehrliche Beruf Respekt verdient.' },
      { q: 'Beurteile die Macht des Pater familias in der römischen familia aus heutiger Sicht.', points: ['Macht des Pater familias beschreiben (Heirat, Strafen, Besitz, Leben und Tod)', 'Argument aus römischer Sicht (z. B. klare Ordnung, Schutz der familia, Sitten der Vorfahren)', 'Argument dagegen (keine Rechte für Frauen, Kinder, Sklaven, Willkür)', 'eindeutiges Urteil mit Begründung, z. B. mit Gleichberechtigung und Menschenwürde'],
        m: 'Der Pater familias hatte die Macht über alle Mitglieder der familia. Er bestimmte, wen seine Kinder heirateten, konnte Strafen bis zur Todesstrafe verhängen und entschied über den Besitz. Aus römischer Sicht sorgte das für eine klare Ordnung, und der Pater familias beschützte die familia und hielt die Sitten der Vorfahren ein. Dagegen spricht, dass Frauen, Kinder und vor allem Sklaven ihm ausgeliefert waren und keine eigenen Rechte hatten. Ich komme zu dem Urteil, dass diese Macht aus heutiger Sicht ungerecht war, weil alle Menschen die gleiche Würde und die gleichen Rechte haben.' },
      { q: 'Beurteile, ob in der römischen Republik alle Menschen mitbestimmen konnten.', points: ['wer mitbestimmen durfte: männliche Bürger ab 16 in den Volksversammlungen, Volkstribunen für die Plebejer', 'Argument für Mitbestimmung (Wahlen, Volkstribunen mit Veto, Volksversammlung stimmt zu)', 'Argument dagegen (Frauen, Kinder, Nichtbürger, Sklaven ausgeschlossen, Stimmen nach Vermögen, Ämter ohne Bezahlung nur für Reiche)', 'eindeutiges Urteil mit Begründung'],
        m: 'In der Republik wählten die männlichen Bürger ab 16 in den Volksversammlungen die Beamten, und die Plebejer hatten mit den Volkstribunen eigene Vertreter mit Veto-Recht. Dafür, dass viele mitbestimmen konnten, spricht also, dass es Wahlen gab und die Volksversammlung z. B. einem Krieg zustimmen musste. Dagegen spricht, dass Frauen, Kinder, Nichtbürger und Sklaven keine politischen Rechte hatten, dass die Stimmen nach Vermögen verteilt waren und dass nur Reiche ein Amt übernehmen konnten, weil Beamte kein Geld bekamen. Ich komme zu dem Urteil, dass in der Republik nicht alle mitbestimmen konnten, weil der größte Teil der Menschen ausgeschlossen war und die Reichen mehr Macht hatten.' },
    ] },
  ],
};
