import { PatchedUserRequestLocale } from 'mosquito-alert'
import type { Taxon, TaxonTreeNode } from 'mosquito-alert'
import { getTaxonAncestors } from '@/utils/TaxonUtils'

const messages: Record<
  number | string, // Taxon ID or 'default
  Record<string, Partial<Record<PatchedUserRequestLocale, string>>>
> = {
  112: {
    // Albopictus
    true: {
      [PatchedUserRequestLocale.Es]:
        '¡Muy buena foto! Has conseguido que se pueda identificar perfectamente el mosquito tigre ya que se ve muy bien su típica línea blanca en el tórax, además de otras características. ¡Gracias por participar!',
      [PatchedUserRequestLocale.Gl]:
        'Moi boa foto! Conseguiches que se poida identificar perfectamente o mosquito tigre xa que se ve moi ben a súa típica liña branca no tórax, ademais doutras características. Grazas por participar!',
      [PatchedUserRequestLocale.En]:
        'Very good picture! You have managed to make the Tiger mosquito easy to identify because you can spot clearly the characteristic white strip in the thorax, apart from other traits. Thanks for participating!',
      [PatchedUserRequestLocale.It]:
        'Ottima immagine! Sei riuscito a rendere la zanzara tigre facilmente identificabile perché si può individuare chiaramente la caratteristica striscia bianca sul torace, oltre ad altri tratti tipici. Grazie per aver partecipato!',
      [PatchedUserRequestLocale.Sq]:
        'Fotografi shumë e mirë! Keni arritur ta bëni të lehtë identifikimin e mushkonjës tigër, sepse mund të dallohet qartë shiriti i bardhë në toraks që është karakteristik, përveç tipareve të tjera. Faleminderit për pjesëmarrjen!',
      [PatchedUserRequestLocale.Hr]:
        'Vrlo dobra slika! Uspjeli ste olakšati determinaciju tigrastog komarca jer se može jasno uočiti karakteristična bijela pruga na prsima, uz ostale osobine. Hvala na sudjelovanju!',
      [PatchedUserRequestLocale.De]:
        'Sehr gutes Foto! Du hast es geschafft, dass man die Tigermücke leicht identifizieren kann, denn man erkennt deutlich den charakteristischen weißen Streifen am Thorax, und auch andere Merkmale. Vielen Dank für deine Teilnahme!',
      [PatchedUserRequestLocale.Mk]:
        'Многу добра слика! Успеавте да го направите тигрестиот комарец лесен за препознавање бидејќи може јасно да се забележи карактеристичната бела лента на градниот кош. Ви благодариме за учеството!',
      [PatchedUserRequestLocale.El]:
        'Πολύ καλή φωτογραφία! Καταφέρατε να μας βοηθήσετε να ταυτοποιήσουμε εύκολα ότι πρόκειται για το Ασιατικό κουνούπι τίγρης. Η ταυτοποίηση βασίστηκε στο γεγονός ότι στη φωτογραφία σας φαίνονται ξεκάθαρα όλα τα χαρακτηριστικά που απαιτούνται για τη σωστή αναγνώρισή του και ειδικά η λευκή γραμμή στο θώρακα του. Σας ευχαριστούμε και συνεχίστε να μας στέλνετε τις φωτογραφίες σας!',
      [PatchedUserRequestLocale.Pt]:
        'Foto muito boa! Conseguiu fazer com que o mosquito tigre fosse fácil de identificar porque se consegue visualizar claramente a faixa branca característica no tórax, além de outras características. Obrigado por participar!',
      [PatchedUserRequestLocale.Ro]:
        'Imagine foarte bună! Ați reușit să faceți țânțarul tigru ușor de identificat, deoarece se vede clar banda albă caracteristică din torace, în afară de alte trăsături. Vă mulțumim pentru participare!',
      [PatchedUserRequestLocale.Sr]:
        'Vrlo dobra fotografija. Vašom fotografijom omogućili ste nam veoma laku identifikaciju azijskog tigrastog komarca, jer su sve karakteristike ove vrste jasno vidljive, kao npr. bela pruga na gornjoj strani leđa (na toraksu). Hvala Vam na učešću.',
      [PatchedUserRequestLocale.Sl]:
        'Zelo dobra fotografija! Iz nje je tigrastega komarja lahko prepoznati, saj se dobro vidijo tipični znaki - bela črta na oprsju ter ostali znaki. Hvala za sodelovanje!',
      [PatchedUserRequestLocale.Ca]:
        "Molt bona foto! Has aconseguit que el mosquit tigre sigui fàcil d'identificar ja que es pot observar clarament la franja blanca en el tòrax, a part d'altres característiques. Gràcies per participar!",
      [PatchedUserRequestLocale.Bg]:
        'Много добра снимка! Успяхте да улесните разпознаването на тигровия комар, защото ясно може да се види характерната бяла ивица на гърба, освен другите белези. Благодарим за участието!',
      [PatchedUserRequestLocale.Fr]:
        "Très belle image! Vous avez réussi à rendre facile à identifier ce Moustique Tigre puisque la typique ligne blanche sur le thorax est très visible, en plus d'autres traits. Merci de votre participation!",
      [PatchedUserRequestLocale.Nl]:
        'Een erg goede foto! De door u gefotografeerde Aziatische tijgermug was makkelijk te identificeren, de karakteristieke witte streep op het borststuk is goed zichtbaar. Bedankt voor uw deelname!',
      [PatchedUserRequestLocale.Hu]:
        'Nagyon jó kép! Sikerült könnyen azonosítani a tigrisszúnyogot, mert eltekintve más karakterektől, a tor jellegzetes fehér csíkja jól látható. Köszönjük a részvételt!',
      [PatchedUserRequestLocale.Sv]:
        'Mycket bra bild! Du har lyckats göra det lätt att identifiera tigermyggan eftersom man tydligt kan se den karaktäristiska vita linjen på mellankroppen, och andra karaktärer. Tack för ditt deltagande!',
    },
    false: {
      [PatchedUserRequestLocale.Es]:
        'Con esta foto no podemos asegurar totalmente que sea un mosquito tigre. No se ve bien la típica línea blanca en el tórax, aunque sí que se ven otras características del mosquito tigre. Aun así, tu observación sigue siendo muy útil. En www.mosquitoalert.com encontrarás trucos para atrapar y fotografiar estos insectos. ¡Envía más fotos!',
      [PatchedUserRequestLocale.Gl]:
        'Con esta foto non podemos asegurar totalmente que sexa un mosquito tigre. Non se ve ben a típica liña branca no tórax, aínda que si que se ven outras características do mosquito tigre. Aínda así, a túa observación segue sendo moi útil. En www.mosquitoalert.com atoparás trucos para atrapar e fotografar estes insectos. Envía máis fotos!',
      [PatchedUserRequestLocale.En]:
        "With this picture, we can't be completely sure that it's a tiger mosquito. You can't see the typical white stripe in the thorax, but you can see other typical traits of the mosquito tiger.  Still, your observation is very useful. At www.mosquitoalert.com you will find tricks and tips for catching and photographing these insects. Please send more pictures!",
      [PatchedUserRequestLocale.It]:
        'Con questa immagine, non possiamo essere completamente sicuri che sia una zanzara tigre. Non si vede la tipica striscia bianca sul torace, ma si possono vedere altri tratti tipici della zanzara tigre. Tuttavia, la tua osservazione è molto utile. Su www.mosquitoalert.com troverai soluzioni e suggerimenti per catturare e fotografare questi insetti. Ti preghiamo di inviare altre foto!',
      [PatchedUserRequestLocale.Sq]:
        'Me këtë fotografi, nuk mund të jemi plotësisht të sigurt që është mushkonja tigër. Nuk mund të shihet shiriti i bardhë në toraks që është karakteristik, por mund të shihen tipare të tjera të veçanta të mushkonjës tigër. Megjithatë, vëzhgimi juaj është shumë i dobishëm. Në www.mosquitoalert.com do të gjeni truke dhe këshilla për kapjen dhe fotografimin e këtyre insekteve. Ju lutemi dërgoni më shumë fotografi!',
      [PatchedUserRequestLocale.Hr]:
        'Na ovoj slici ne možemo sa sigurnošću odrediti radi li se o tigrastom komarcu. Na prsima se ne može vidjeti tipična bijela pruga, ali vidljive su druge karakteristike tigrastog komaraca. Ipak, vaše je zapažanje vrlo korisno. Na www.mosquitoalert.com pronaći ćete savjete za hvatanje i fotografiranje komaraca. Molimo pošaljite još slika!',
      [PatchedUserRequestLocale.De]:
        'Bei diesem Foto können wir nicht ganz sicher sein, dass es sich um eine Tigermücke handelt. Man kann den typischen weißen Streifen im Thorax nicht sehen, aber man kann andere typische Merkmale der Tigermücke erkennen.  Trotzdem ist deine Beobachtung sehr nützlich. Unter www.mosquitoalert.com findest du Tricks und Tipps zum Fangen und Fotografieren dieser Insekten. Bitte sende weitere Fotos!',
      [PatchedUserRequestLocale.Mk]:
        'Со оваа слика, не можеме да бидеме потполно сигурни дека станува збор за тигрест комарец. Не може да се види типичната бела лента на градниот кош, но може да се видат останати типични црти на тигрестиот комарец. Сепак, Вашето набљудување е многу корисно. На www.mosquitoalert.com ќе најдете трикови и совети за фаќање и фотографирање на овие инсекти. Ве молиме, испратете повеќе слики!',
      [PatchedUserRequestLocale.El]:
        "Με τη συγκεκριμένη φωτογραφία δεν μπορούμε να ταυτοποιήσουμε με αξιοπιστία αν πρόκειται για το Ασιατικό κουνούπι τίγρης. Η χαρακτηριστική άσπρη γραμμή στο θώρακα, που έχει το συγκεκριμένο κουνούπι, δεν είναι ευδιάκριτη. Παρ' όλα αυτά, η παρατήρησή σας κρίνεται πολύ χρήσιμη. Για διευκόλυνσή σας, στη σελίδα www.mosquitoalert.com θα βρείτε όλες τις απαραίτητες πληροφορίες που απαιτούνται για να φωτογραφίσετε σωστά τα κουνούπια. Σας ευχαριστούμε και συνεχίστε να μας στέλνετε τις φωτογραφίες σας!",
      [PatchedUserRequestLocale.Pt]:
        'Com esta foto, não podemos ter certeza de que é um mosquito tigre. Não se consegue ver a faixa branca típica no tórax, mas visualizam-se outras características típicas do mosquito tigre. Ainda assim, a sua observação é muito útil. Em www.mosquitoalert.com vai encontrar truques e dicas para capturar e fotografar estes insetos. Por favor, envie mais fotos!',
      [PatchedUserRequestLocale.Ro]:
        'Cu această imagine nu putem fi complet siguri că specimenul este un țânțar tigru. Nu se vede dunga albă tipică în torace, dar se pot observa alte trăsături tipice ale țânțarului tigru. Totuși, observația dvs. este foarte utilă. La www.mosquitoalert.com veți găsi trucuri și sfaturi pentru prinderea și fotografierea acestor insecte. Vă rugăm să trimiteți mai multe poze!',
      [PatchedUserRequestLocale.Sr]:
        'Vaša fotografija ne omogućava da sa sigurnošću potvrdimo da je reč o azijskom tigrastom komarcu. Nije vidljiva tipična bela pruga na leđnoj strani (na toraksu), ali ostale tipične šare ukazuju na azijskog tigrastog komarca. U svakom slučaju, Vaš nalaz je veoma koristan. Na www.mosquitoalert.com pronaći ćete savete i trikove za hvatanje i fotografisanje ovih insekata. Molimo Vas da nam pošaljete više fotografija.',
      [PatchedUserRequestLocale.Sl]:
        'Nismo popolnoma prepričani, da je na fotografiji tigrasti komar. Tipična bela črta na oprsju ni vidna, so pa vidne druge lastnosti tigrastih komarjev. Kljub temu je vaše opažanje zelo koristno. Na www.mosquitoalert.com boste našli trike in nasvete za lovljenje in fotografiranje teh žuželk. Prosimo, pošljite več slik!',
      [PatchedUserRequestLocale.Ca]:
        "Amb aquesta foto, no podem estar completament segurs que es tracta d'un mosquit tigre. No es pot veure la típica franja blanca en el tòrax, però sí que es veuen altres característiques del mosquit tigre. Tot i així, la teva observació és molt útil. A www.mosquitoalert.com trobaràs trucs per reconèixer aquestes espècies i caçar i fotografiar aquests insectes. Si et plau envia més fotos!",
      [PatchedUserRequestLocale.Bg]:
        'От тази снимка не можем да бъдем напълно сигурни, че става дума за тигров комар. Не може да се види типичната бяла ивица на гърба, но могат да се видят други типични белези на тигровия комар. Все пак, наблюдението Ви е много полезно. На www.mosquitoalert.com ще намерите съвети за улавяне и фотографиране на тези насекоми. Моля, изпращайте още снимки!',
      [PatchedUserRequestLocale.Fr]:
        "Sur cette image nous ne pouvons pas assurer tout à fait qu'il s'agisse d'un Moustique Tigre. La ligne blanche sur le thorax n'est pas visible, bien que d'autres trait typiques le soient. Toutefois, votre observation est utile. Sur www.mosquitoalert.com vous rencontrerez des astuces et des conseils pour capturer et photographier ces insectes. Envoyez encore des photos s'il vous plaît!",
      [PatchedUserRequestLocale.Nl]:
        "Met deze foto kunnen we niet vaststellen of het om een tijgermug gaat. De typische witte streep op het borststuk is niet zichtbaar, maar andere typische kenmerken van de Aziatische tijgermug zijn wel zichtbaar. Toch is uw observatie erg nuttig. Op www.mosquitoalert.com vind u tips en tricks voor het vangen en fotograferen van deze insecten. Blijf alstublieft foto's insturen!",
      [PatchedUserRequestLocale.Hu]:
        'Sajnos ezzel a képpel nem lehetünk biztosak abban, hogy ez egy tigrisszúnyog. Nem látható a tor jellegzetes fehér csíkja, de a tigrisszúnyogok más tipikus karakterei látszanak. Ennek ellenére, a megfigyelésed nagyon hasznos számunkra. A www.mosquitoalert.com oldalon találsz különböző tippeket és trükköket a szúnyogok megfogására és fotózására. Kérünk, küldj további képeket!',
      [PatchedUserRequestLocale.Sv]:
        'Med denna bild kan vi inte vara helt säkra på om det är en tigermygga. Man kan inte se det typiska vita strecket på mellankroppen, men man kan se andra typiska karaktärer hos en tigermygga. Din observation är dock ändå väldigt användbar. På www.mosquitoalert.com kan du hitta tips på hur man fångar och fotograferar dessa insekter. Skicka gärna fler bilder!',
    },
  },
  113: {
    // Aegypti
    true: {
      [PatchedUserRequestLocale.Es]:
        'Muy buena foto! Has conseguido que se pueda identificar perfectamente el mosquito de la fiebre amarilla ya que se ve muy bien su dibujo en forma de lira en el tórax, además de otras características. ¡Gracias por participar!',
      [PatchedUserRequestLocale.Gl]:
        'Moi boa foto! Conseguiches que se poida identificar perfectamente o mosquito da febre amarela xa que se ve moi ben o seu debuxo en forma de lira no tórax, ademais doutras características. Grazas por participar!',
      [PatchedUserRequestLocale.En]:
        'Very good picture! You have managed to make the yellow fever mosquito easy to identify because you can spot clearly the characteristic lyre shape in the thorax, apart from other traits. Thanks for participating!',
      [PatchedUserRequestLocale.It]:
        'Ottima immagine! Sei riuscito a rendere la zanzara della febbre gialla facilmente identificabile perché si può individuare chiaramente la caratteristica forma a lira sul torace, oltre ad altri tratti tipici. Grazie per aver partecipato!',
      [PatchedUserRequestLocale.Sq]:
        'Fotografi shumë e mirë! Keni arritur ta bëni të lehtë përcaktimin e mushkonjës së ethes së verdha, sepse mund të dallohet qartë forma karakteristike si patkua në toraks, përveç tipareve të tjera. Faleminderit për pjesëmarrjen!',
      [PatchedUserRequestLocale.Hr]:
        'Vrlo dobra slika! Uspjeli ste olakšati prepoznavanje komaraca žute groznice jer se na prsima može jasno uočiti karakteristični oblik lire, uz ostala svojstava. Hvala na sudjelovanju! ',
      [PatchedUserRequestLocale.De]:
        'Sehr gutes Foto! Du hast es geschafft, dass man die Gelbfiebermücke leicht identifizieren kann, denn man erkennt deutlich die Leierförmigen Streifen am Thorax, und auch andere Merkmale. Vielen Dank für deine Teilnahme!',
      [PatchedUserRequestLocale.Mk]:
        'Многу добра слика! Успеавте да го направите комарецот на жолта треска лесен за препознавање бидејќи јасно може да се забележи карактеристичната форма на лира на градниот кош. Ви благодариме за учеството!',
      [PatchedUserRequestLocale.El]:
        'Πολύ ωραία φωτογραφία! Φαίνεται ξεκάθαρα ότι πρόκειται για το κουνούπι του κίτρινου πυρετού. Η ταυτοποίηση βασίστηκε στο γεγονός ότι στη φωτογραφία σας φαίνονται ξεκάθαρα όλα τα χαρακτηριστικά που απαιτούνται για τη σωστή αναγνώρισή του και ειδικά το χαρακτηριστικό σχήμα της "λύρας" στο θώρακα του. Σας ευχαριστούμε και συνεχίστε να μας στέλνετε τις φωτογραφίες σας!',
      [PatchedUserRequestLocale.Pt]:
        'Foto muito boa! Conseguiu fazer com que o mosquito da febre amarela fosse fácil de identificar porque se consegue visualizar claramente a forma de lira característica no tórax, além de outras características. Obrigado por participar!',
      [PatchedUserRequestLocale.Ro]:
        'Imagine foarte bună! Ați reușit să faceți pe țânțarul febrei galbene ușor de identificat, deoarece se poate observa în mod clar forma caracteristică a lirei în torace, în afară de alte trăsături. Vă mulțumim pentru participare!',
      [PatchedUserRequestLocale.Sr]:
        'Vrlo dobra fotografija! Vašom fotografijom omogućili ste nam veoma laku identifikaciju komarca žute groznice, jer su sve karakteristike ove vrste jasno vidljive, kao npr. šara u obliku instrumenta lira na gornjoj strani leđa (na toraksu). Hvala Vam na učešću.',
      [PatchedUserRequestLocale.Sl]:
        'Zelo dobra slika! Komarja ščitarja je mogoče enostavno prepoznati, saj je na oprsju jasno opazna značilna oblika lire, poleg drugih lastnosti. Hvala za sodelovanje!',
      [PatchedUserRequestLocale.Ca]:
        "Molt bona foto! Has aconseguit que el mosquit de la febre groga sigui fàcil d'identificar ja que es poden observar clarament la característica forma de lira en el tòrax, a part d'altres característiques. Gràcies per participar!",
      [PatchedUserRequestLocale.Bg]:
        'Много добра снимка! Успяхте да улесните идентифицирането на комара на жълтата треска, защото ясно може да се види характерната лировидна шарка на гърба, освен другите белези. Благодарим за участието!',
      [PatchedUserRequestLocale.Fr]:
        "Très belle image! Vous avez réussi à rendre facile à identifier ce moustique de la fièvre jaune puisque la typique forme en lyre sur le thorax est très visible, en plus d'autres traits. Merci de votre participation!",
      [PatchedUserRequestLocale.Nl]:
        'Een erg goede foto! De door u gefotografeerde gelekoortsmug was makkelijk te identificeren, de karakteristieke lier vorm op het borststuk was duidelijk zichtbaar. Bedankt voor uw deelname!',
      [PatchedUserRequestLocale.Hu]:
        'Nagyon jó kép! Sikerült könnyen azonosítani a sárgaláz szúnyogot, mert eltekintve más karakterektől, a tor jellegzetes lant alakú mintázata jól látható. Köszönjük a részvételt!',
      [PatchedUserRequestLocale.Sv]:
        'Mycket bra bild! Du har lyckats göra det lätt att identifiera gula febern myggan eftersom man tydligt kan se det karaktäristiska lyrmönstret på mellankroppen, och andra karaktärer. Tack för ditt deltagande!',
    },
    false: {
      [PatchedUserRequestLocale.Es]:
        'Con esta foto no podemos asegurar totalmente que sea un mosquito de la fiebre amarilla. No se ve bien el típico dibujo en forma de lira en el tórax, aunque sí que se ven otras características del mosquito de la fiebre amarilla. Aun así, tu observación sigue siendo muy útil. En www.mosquitoalert.com encontrarás trucos para atrapar y fotografiar estos insectos. ¡Envía más fotos!',
      [PatchedUserRequestLocale.Gl]:
        'Con esta foto non podemos asegurar totalmente que sexa un mosquito da febre amarela. Non se ve ben o típico debuxo en forma de lira no tórax, aínda que si que se ven outras características do mosquito da febre amarela. Aínda así, a túa observación segue sendo moi útil. En www.mosquitoalert.com atoparás trucos para atrapar e fotografar estes insectos. Envía máis fotos!',
      [PatchedUserRequestLocale.En]:
        "With this picture, we can't be completely sure that it's a yellow fever mosquito. You can't see the typical lyre shape in the thorax, but you can see other typical traits of the yellow fever mosquito.  Still, your observation is very useful. At www.mosquitoalert.com you will find tricks and tips for catching and photographing these insects. Please send more pictures!",
      [PatchedUserRequestLocale.It]:
        'Con questa immagine, non possiamo essere completamente sicuri che sia la zanzara della febbre gialla. Non è possibile visualizzare abbastanza caratteristiche, sebbene siano presenti altri tratti tipici della specie. Tuttavia, la tua osservazione è molto utile. Su www.mosquitoalert.com troverai soluzioni e suggerimenti per catturare e fotografare questi insetti. Ti preghiamo di inviare altre foto!',
      [PatchedUserRequestLocale.Sq]:
        'Me këtë fotografi, nuk mund të jemi plotësisht të sigurt nëse është mushkonja e ethes së verdhë. Nuk mund të shihet forma tipike si patkua në toraks, por mund të shihen tipare të tjera të veçanta të mushkonjës së ethes së verdhë. Megjithatë, vëzhgimi juaj është shumë i dobishëm. Në www.mosquitoalert.com do të gjeni truke dhe këshilla për kapjen dhe fotografimin e këtyre insekteve. Ju lutemi dërgoni më shumë fotografi!',
      [PatchedUserRequestLocale.Hr]:
        'Ovom slikom ne možemo biti potpuno sigurni da se radi o komarcu žute groznice. Ne može se vidjeti tipičan oblik lire na prsima, ali su vidljive druge tipične osobine komaraca žute groznice. Ipak, vaše je zapažanje vrlo korisno. Na www.mosquitoalert.com pronaći ćete trikove i savjete za hvatanje i fotografiranje ovih insekata. Molimo pošaljite još slika!',
      [PatchedUserRequestLocale.De]:
        'Bei diesem Foto können wir nicht ganz sicher sein, dass es sich um eine Gelbfiebermücke handelt. Man kann die Leierförmigen Streifen im Thorax nicht sehen, aber man kann andere typische Merkmale der Tigermücke erkennen.  Trotzdem ist deine Beobachtung sehr nützlich. Unter www.mosquitoalert.com findest du Tricks und Tipps zum Fangen und Fotografieren dieser Insekten. Bitte sende weitere Fotos!',
      [PatchedUserRequestLocale.Mk]:
        'Со оваа слика, не можеме да бидеме целосно сигурни дека станува збор за комарецот на жолта треска. Не може да се види типичната форма на лира на градниот кош, но може да се видат останатите типични карактеристики на овој вид. Сепак, Вашето набљудување е многу корисно. На www.mosquitoalert.com ќе најдете трикови и совети за фаќање и фотографирање на овие инсекти. Ве молиме, испратете повеќе слики!',
      [PatchedUserRequestLocale.El]:
        'Με τη συγκεκριμένη φωτογραφία δεν μπορούμε να ταυτοποιήσουμε με αξιοπιστία αν πρόκειται για το κουνούπι του κίτρινου πυρετού! Το χαρακτηριστικό σχήμα της "λύρας" στο θώρακα, που έχει το συγκεκριμένο κουνούπι, δεν είναι ευδιάκριτο. Παρ\' όλα αυτά, η παρατήρησή σας κρίνεται πολύ χρήσιμη. Για διευκόλυνσή σας, στη σελίδα www.mosquitoalert.com θα βρείτε όλες τις απαραίτητες πληροφορίες που απαιτούνται για να φωτογραφίσετε σωστά τα κουνούπια. Σας ευχαριστούμε και συνεχίστε να μας στέλνετε τις φωτογραφίες σας!',
      [PatchedUserRequestLocale.Pt]:
        'Com esta foto, não podemos ter certeza de que é um mosquito da febre amarela. Não se consegue ver a forma típica de lira no tórax, mas podem-se visualizar outras características típicas do mosquito da febre amarela. Ainda assim, a sua observação é muito útil. Em www.mosquitoalert.com vai encontrar truques e dicas para capturar e fotografar estes insetos. Por favor, envie mais fotos!',
      [PatchedUserRequestLocale.Ro]:
        'Cu această imagine nu putem fi complet siguri că este vorba de un țânțar al febrei galbene. Nu se vede forma tipică a lirei în torace, dar se pot observa alte trăsături tipice ale țânțarul febrei galbene. Totuși, observația dvs. este foarte utilă. La www.mosquitoalert.com veți găsi trucuri și sfaturi pentru prinderea și fotografierea acestor insecte. Vă rugăm să trimiteți mai multe poze!',
      [PatchedUserRequestLocale.Sr]:
        'Vaša fotografija ne omogućava da sa sigurnošću potvrdimo da je reč o komarcu žute groznice (Aedes aegypti). Nisu vidljive tipične šare u obliku instrumenta lira na leđnoj strani (na toraksu), ali ostale tipične šare ukazuju na ovu vrstu komarca. U svakom slučaju, Vaš nalaz je veoma koristan. Na www.mosquitoalert.com pronaći ćete savete i trikove za hvatanje i fotografisanje ovih insekata. Molimo Vas da nam pošaljete više fotografija.',
      [PatchedUserRequestLocale.Sl]:
        'Nismo popolnoma prepričani, da je na fotografiji komar ščitar. Tipičen vzorec v obliki lire na oprsju ni viden, so pa vidne druge lastnosti komarjev ščitarjev. Kljub temu je vaše opažanje zelo koristno. Na www.mosquitoalert.com boste našli trike in nasvete za lovljenje in fotografiranje teh žuželk. Prosimo, pošljite več slik!',
      [PatchedUserRequestLocale.Ca]:
        "Amb aquesta foto, no podem estar completament segurs que es tracta d'un mosquit de la febre groga. No es pot veure la la típica forma de lira en el tòrax, però sí que es veuen altres característiques del mosquit de la febre groga. Tot i així, la teva observació és molt útil. A www.mosquitoalert.com trobaràs trucs per reconèixer aquestes espècies i caçar i fotografiar aquests insectes. Si et plau envia més fotos!",
      [PatchedUserRequestLocale.Bg]:
        'От тази снимка не можем да бъдем напълно сигурни, че става дума за комара на жълтата треска. Не може да се види характерната лировидна шарка на гърба, но могат да се видят други типични белези на комара на жълтата треска. Все пак, наблюдението Ви е много полезно. На www.mosquitoalert.com ще намерите съвети за улавяне и фотографиране на тези насекоми. Моля, изпращайте още снимки!',
      [PatchedUserRequestLocale.Fr]:
        "Sur cette image nous ne pouvons pas assurer tout à fait qu'il s'agisse d'un moustique à la fièvre jaune. Le dessin en lyre sur le thorax n'est pas visible, bien que d'autres trait typiques le soient. Toutefois, votre observation est utile. Sur www.mosquitoalert.com vous rencontrerez des astuces et des conseils pour capturer et photographier ces insectes. Envoyez encore des photos s'il vous plaît!",
      [PatchedUserRequestLocale.Nl]:
        "Met deze foto kunnen we niet vaststellen of het om een gelekoortsmug gaat. De typische liervormige markeringen op het borststuk zijn niet zichtbaar, maar andere typische kenmerken van de gelekoortsmug zijn wel zichtbaar. Toch is uw observatie erg nuttig. Op www.mosquitoalert.com vind u tips en tricks voor het vangen en fotograferen van deze insecten. Blijf alstublieft foto's insturen!",
      [PatchedUserRequestLocale.Hu]:
        'Sajnos ezzel a képpel nem lehetünk biztosak abban, hogy ez egy sárgaláz szúnyog. Nem látható a tor jellegzetes lant alakú mintázata, de a sárgaláz szúnyog más tipikus karakterei látszanak. Ennek ellenére, a megfigyelésed nagyon hasznos számunkra. A www.mosquitoalert.com oldalon találsz különböző tippeket és trükköket a szúnyogok megfogására és fotózására. Kérünk, küldj további képeket!',
      [PatchedUserRequestLocale.Sv]:
        'Med denna bild kan vi inte vara helt säkra på att det är en gula febern mygga. Man kan inte se det typiska lyrformade mönstret på mellankroppen, men man kan se andra typiska karaktärer hos gula febern myggan. Din observation är dock ändå väldigt användbar. På www.mosquitoalert.com kan du hitta tips på hur man fångar och fotograferar dessa insekter. Skicka gärna fler bilder!',
    },
  },
  114: {
    // Japonicus
    true: {
      [PatchedUserRequestLocale.Es]:
        '¡Muy buena foto! Has conseguido que se pueda identificar el Aedes japonicus ya que se ve muy bien la forma característica del tórax, además de las rayas blancas en las patas. ¡Gracias por participar!',
      [PatchedUserRequestLocale.Gl]:
        'Moi boa foto! Conseguiches que se poida identificar o Aedes japonicus xa que se ve moi ben a forma característica do tórax, ademais das raias brancas nas patas. Grazas por participar!',
      [PatchedUserRequestLocale.En]:
        'Very good picture! You have managed to make Aedes japonicus easy to identify because you can spot clearly the characteristic shape in the thorax, plus the leg white stripes. Thanks for participating!',
      [PatchedUserRequestLocale.It]:
        'Ottima immagine! Sei riuscito a rendere Aedes japonicus facilmente identificabile perché si può individuare chiaramente il disegno caratteristico sul torace, più le strisce bianche della zampa posteriore. Grazie per aver partecipato!',
      [PatchedUserRequestLocale.Sq]:
        'Fotografi shumë e mirë! Ju keni arritur ta bëni Aedes japonicus të lehtë për tu identifikuar sepse mund të dalloni qartë formën karakteristike në toraks, plus vija të bardha të këmbës. Faleminderit për pjesëmarrjen!',
      [PatchedUserRequestLocale.Hr]:
        'Vrlo dobra slika! Uspjeli ste olakšati prepoznavanje vrste Aedes japonicus, može se jasno uočiti karakterističan oblik na prsima kao i bijele pruge na nogama. Hvala na sudjelovanju!',
      [PatchedUserRequestLocale.De]:
        'Sehr gutes Foto! Du hast es geschafft, dass man die Japanische Buschmücke leicht identifizieren kann, denn man erkennt deutlich das charakteristischen Muster am Thorax, sowie auch die weißen Beinstreifen. Vielen Dank für deine Teilnahme!',
      [PatchedUserRequestLocale.Mk]:
        'Многу добра слика! Успеавте да направите слика каде лесно се препознава Aedes japonicus, бидејќи јасно може да ја забележите карактеристичната форма во градниот кош, како и белите ленти на нозете. Ви благодариме за учеството!',
      [PatchedUserRequestLocale.El]:
        'Πολύ καλή φωτογραφία! Καταφέρατε να μας βοηθήσετε να ταυτοποιήσουμε εύκολα ότι πρόκειται για το είδος Aedes japonicus. Η ταυτοποίηση βασίστηκε στο γεγονός ότι στη φωτογραφία σας φαίνονται ξεκάθαρα όλα τα χαρακτηριστικά που απαιτούνται για τη σωστή αναγνώρισή του και ειδικά το χαρακτηριστικό σχήμα στο θώρακα του καθώς και οι λευκές λωρίδες στα πόδια. Σας ευχαριστούμε και συνεχίστε να μας στέλνετε τις φωτογραφίες σας!',
      [PatchedUserRequestLocale.Pt]:
        'Foto muito boa! Conseguiu fazer com que o Aedes japonicus fosse fácil de identificar porque se consegue identificar claramente a forma característica no tórax, além das listras brancas da perna. Obrigado por participar!',
      [PatchedUserRequestLocale.Ro]:
        'Imagine foarte bună! Ați reușit să faceți Aedes japonicus ușor de identificat, deoarece se poate observa clar forma caracteristică din torace, plus dungile albe ale picioarelor. Vă mulțumim pentru participare!',
      [PatchedUserRequestLocale.Sr]:
        'Vrlo dobra fotografija. Vašom fotografijom omogućili ste nam veoma laku identifikaciju japanskog komarca, jer su karakteristične šare na leđima ove vrste jasno vidljive, kao i beli prstenovi na nogama. Hvala Vam na učešću.',
      [PatchedUserRequestLocale.Sl]:
        'Zelo dobra fotografija! Iz nje je komarja ščitarja lahko prepoznati, saj se dobro vidijo tipični znaki - bel vzorec v obliki lire oprsju ter ostali znaki. Hvala za sodelovanje!',
      [PatchedUserRequestLocale.Ca]:
        "Molt bona foto! Has aconseguit que l'Aedes japonicus sigui fàcil d'identificar ja que es pot observar clarament la característica forma en el tòrax, a més de les franges blanques de les potes. Gràcies per participar!",
      [PatchedUserRequestLocale.Bg]:
        'Много добра снимка! Успяхте да улесните разпознаването на Aedes japonicus, защото може ясно да се види характерната шарка на гърба, заедно с белите ивици на краката. Благодарим за участието!',
      [PatchedUserRequestLocale.Fr]:
        'Très belle image! Vous avez réussi à rendre facile à identifier cet Aedes japonicus  puisque le typique dessin sur le thorax est très visible, en plus des pattes ornées de franges blanches. Merci de votre participation!',
      [PatchedUserRequestLocale.Nl]:
        'Een erg goede foto! De door u gefotografeerde Aziatische bosmug was makkelijk te identificeren, de karakteristieke vorm op het borststuk en de gestreepte poten waren duidelijk zichtbaar. Bedankt voor uw deelname!',
      [PatchedUserRequestLocale.Hu]:
        'Nagyon jó kép! Sikerült könnyen azonosítani a japán bozótszúnyogot, mert a tor jellegzetes mintázata és a lábakon lévő fehér gyűrűk jól látszanak. Köszönjük a részvételt!',
      [PatchedUserRequestLocale.Sv]:
        'Mycket bra bild! Du har lyckats göra det lätt att identifiera Aedes japonicus eftersom man tydligt kan se det karaktäristiska mönstret på mellankroppen och benen med vita ränder. Tack för ditt deltagande!',
    },
    false: {
      [PatchedUserRequestLocale.Es]:
        'Con esta foto no podemos asegurar totalmente que sea un Aedes japonicus. No se ve bien la forma característica del tórax y las rayas blancas en las patas, aunque se aprecian otras características típicas del Aedes japonicus. Aun así, tu observación sigue siendo muy útil. En www.mosquitoalert.com encontrarás trucos para atrapar y fotografiar estos insectos. ¡Envía más fotos!',
      [PatchedUserRequestLocale.Gl]:
        'Con esta foto non podemos asegurar totalmente que sexa un Aedes japonicus. Non se ve ben a forma característica do tórax e as raias brancas nas patas, aínda que se aprecian outras características típicas do Aedes japonicus. Aínda así, a túa observación segue sendo moi útil. En www.mosquitoalert.com atoparás trucos para atrapar e fotografar estes insectos. Envía máis fotos!',
      [PatchedUserRequestLocale.En]:
        "With this picture, we can't be completely sure that it's an Aedes japonicus mosquito. You can't simultaneously see the thorax pattern and the leg stripes, but you can see other typical traits of Aedes japonicus.  Still, your observation is very useful. At www.mosquitoalert.com you will find tricks and tips for catching and photographing these insects. Please send more pictures!",
      [PatchedUserRequestLocale.It]:
        'Con questa immagine, non possiamo essere completamente sicuri che sia una Aedes japonicus. Non è possibile visualizzare abbastanza caratteristiche, sebbene siano presenti altri tratti tipici della specie. Tuttavia, la tua osservazione è molto utile. Su www.mosquitoalert.com troverai soluzioni e suggerimenti per catturare e fotografare questi insetti. Ti preghiamo di inviare altre foto!',
      [PatchedUserRequestLocale.Sq]:
        'Me këtë fotografi, nuk mund të jemi plotësisht të sigurt se është mushkonja Aedes japonicus. Nuk mund të shihen njëkohësisht forma e kraharorit dhe shiritat e këmbëve, por mund të shihen tipare të tjera të veçanta të Aedes japonicus. Megjithatë, vëzhgimi juaj është shumë i dobishëm. Në www.mosquitoalert.com do të gjeni truke dhe këshilla për kapjen dhe fotografimin e këtyre insekteve. Ju lutemi dërgoni më shumë fotografi!',
      [PatchedUserRequestLocale.Hr]:
        'Ovom slikom ne možemo biti potpuno sigurni da se radi o komarcu Aedes japonicus. Ne može se istovremeno vidjeti uzorak prsa i pruga na nogama, ali se mogu vidjeti druge tipične osobine Aedes japonicus. Ipak, vaše je zapažanje vrlo korisno. Na www.mosquitoalert.com pronaći ćete trikove i savjete za hvatanje i fotografiranje ovih insekata. Molimo pošaljite još slika!',
      [PatchedUserRequestLocale.De]:
        'Bei diesem Foto können wir nicht ganz sicher sein, dass es sich um eine Japanische Buschmücke handelt. Man kann nicht beides, das Thoraxmuster und auch die Beinstreifen erkennen, aber man kann andere typische Merkmale der Japanischen Buschmücke sehen. Trotzdem ist deine Beobachtung sehr nützlich. Unter www.mosquitoalert.com findest du Tricks und Tipps zum Fangen und Fotografieren dieser Insekten. Bitte sende weitere Fotos!',
      [PatchedUserRequestLocale.Mk]:
        'Со оваа слика, не можеме да бидеме потполно сигурни дека станува збор за комарецот Aedes japonicus. Не може истовремено да се види шемата на градниот кош и лентите на нозете, но може да се забележат останатите типични карактеристики на Aedes japonicus. Сепак, Вашето набљудување е многу корисно. На www.mosquitoalert.com ќе најдете трикови и совети за фаќање и фотографирање на овие инсекти. Ве молиме, испратете повеќе слики!',
      [PatchedUserRequestLocale.El]:
        "Με τη συγκεκριμένη φωτογραφία δεν μπορούμε να ταυτοποιήσουμε με αξιοπιστία αν πρόκειται για το κουνούπι Aedes japonicus. Βασικά χαρακτηριστικά του, όπως το σχήμα στο θώρακα και οι λευκές λωρίδες στα πόδια, δεν είναι ευδιάκριτα. Παρ' όλα αυτά, η παρατήρησή σας κρίνεται πολύ χρήσιμη. Για διευκόλυνσή σας, στη σελίδα www.mosquitoalert.com θα βρείτε όλες τις απαραίτητες πληροφορίες που απαιτούνται για να φωτογραφίσετε σωστά τα κουνούπια. Σας ευχαριστούμε και συνεχίστε να μας στέλνετε τις φωτογραφίες σας!",
      [PatchedUserRequestLocale.Pt]:
        'Com esta foto, não podemos ter certeza de que é um mosquito Aedes japonicus. Não se conseguem visualizar simultaneamente o padrão do tórax e as listras nas pernas, mas podem-se ver outras características típicas do Aedes japonicus. Ainda assim, a sua observação é muito útil. Em www.mosquitoalert.com vai encontrar truques e dicas para capturar e fotografar estes insetos. Por favor, envie mais fotos!',
      [PatchedUserRequestLocale.Ro]:
        'Cu această imagine nu putem fi complet siguri că este un țânțar Aedes japonicus. Nu se vede simultan modelul toracelui și dungile picioarelor, dar se pot observa alte trăsături tipice ale Aedes japonicus. Totuși, observația dvs. este foarte utilă. La www.mosquitoalert.com veți găsi trucuri și sfaturi pentru prinderea și fotografierea acestor insecte. Vă rugăm să trimiteți mai multe poze!',
      [PatchedUserRequestLocale.Sr]:
        'Vaša fotografija ne omogućava da sa sigurnošću potvrdimo da je reč o japanskom komarcu (Aedes japonicus). Nisu vidljive tipične šare na leđnoj strani (na toraksu) i prstenovi na nogama, ali ostale tipične šare ukazuju na ovu vrstu komarca. U svakom slučaju, Vaš nalaz je veoma koristan. Na www.mosquitoalert.com pronaći ćete savete i trikove za hvatanje i fotografisanje ovih insekata. Molimo Vas da nam pošaljete više fotografija.',
      [PatchedUserRequestLocale.Sl]:
        'Nismo popolnoma prepričani, da je na fotografiji japonski komar. Tipičen vzorec na oprsju in črte na nogah niso dobro vidne, so pa vidne druge lastnosti japonksih komarjev. Kljub temu je vaše opažanje zelo koristno. Na www.mosquitoalert.com boste našli trike in nasvete za lovljenje in fotografiranje teh žuželk. Prosimo, pošljite več slik!',
      [PatchedUserRequestLocale.Ca]:
        "Amb aquesta foto, no podem estar completament segurs que es tracta d'un mosquit Aedes japonicus. No es pot veure al mateix temps el patró en el tòrax i les franges de les potes, però sí que es veuen altres característiques d'Aedes japonicus. Tot i així, la teva observació és molt útil. A www.mosquitoalert.com trobaràs trucs per reconèixer aquestes espècies i caçar i fotografiar aquests insectes. Si et plau envia més fotos!",
      [PatchedUserRequestLocale.Bg]:
        'От тази снимка не можем да бъдем напълно сигурни, че става дума за комара Aedes japonicus. Не могат едновременно да се видят шарката на гърба и ивиците на краката, но могат да се видят други характерни белези на Aedes japonicus. Все пак, наблюдението Ви е много полезно. На www.mosquitoalert.com ще намерите съвети за улавяне и фотографиране на тези насекоми. Моля, изпращайте още снимки!',
      [PatchedUserRequestLocale.Fr]:
        "Sur cette image nous ne pouvons pas assurer tout à fait qu'il s'agisse d'un Aedes japonicus. Le dessin sur le thorax n'est pas visible en même temps que les pattes ornées de franges blanches. Toutefois, votre observation est utile. Sur www.mosquitoalert.com vous rencontrerez des astuces et des conseils pour capturer et photographier ces insectes. Envoyez encore des photos s'il vous plaît!",
      [PatchedUserRequestLocale.Nl]:
        "Met deze foto kunnen we niet vaststellen of het om een Aziatische bosmug gaat. De typische markeringen op het borststuk en de gestreepte poten zijn niet beiden zichtbaar. Toch is uw observatie erg nuttig. Op www.mosquitoalert.com vind u tips en tricks voor het vangen en fotograferen van deze insecten. Blijf alstublieft foto's insturen!",
      [PatchedUserRequestLocale.Hu]:
        'Sajnos ezzel a képpel nem lehetünk biztosak abban, hogy ez egy japán bozótszúnyog. Nem látható a tor jellegzetes mintázata és a lábak gyűrűi, de a japán bozótszúnyog más tipikus karakterei látszanak. Ennek ellenére, a megfigyelésed nagyon hasznos számunkra. A www.mosquitoalert.com oldalon találsz különböző tippeket és trükköket a szúnyogok megfogására és fotózására. Kérünk, küldj további képeket!',
      [PatchedUserRequestLocale.Sv]:
        'Med denna bild kan vi inte vara helt säkra på att det är en Aedes japonicus mygga. Man kan inte samtidigt se mönstret på mellankroppen och ränderna på benen, men man kan se andra typiska karaktärer hos Aedes japonicus. Din observation är dock ändå väldigt användbar. På www.mosquitoalert.com kan du hitta tips på hur man fångar och fotograferar dessa insekter. Skicka gärna fler bilder!',
    },
  },
  115: {
    // Koreicus
    true: {
      [PatchedUserRequestLocale.Es]:
        '¡Muy buena foto! Has conseguido que este Aedes koreicus sea identificable ya que se ve muy bien la forma característica del tórax, además de las rayas blancas en las patas. ¡Gracias por participar!',
      [PatchedUserRequestLocale.Gl]:
        'Moi boa foto! Conseguiches que este Aedes koreicus sexa identificable xa que se ve moi ben a forma característica do tórax, ademais das raias brancas nas patas. Grazas por participar!',
      [PatchedUserRequestLocale.En]:
        'Very good picture! You have managed to make Aedes koreicus easy to identify because you can spot clearly the characteristic shape in the thorax, plus the leg white stripes. Thanks for participating!',
      [PatchedUserRequestLocale.It]:
        'Ottima immagine! Sei riuscito a rendere Aedes koreicus facilmente identificabile perché si può individuare chiaramente il disegno caratteristico sul torace, più le strisce bianche della zampa posteriore. Grazie per aver partecipato!',
      [PatchedUserRequestLocale.Sq]:
        'Fotografi shumë e mirë! Keni arritur ta bëni të lehtë identifikimin e Aedes koreicus, sepse mund të dallohen qartë forma karakteristike në toraks, si edhe vijat e bardha të këmbës. Faleminderit për pjesëmarrjen!',
      [PatchedUserRequestLocale.Hr]:
        'Vrlo dobra slika! Uspjeli ste olakšati prepoznavanje Aedes koreicus jer se može jasno uočiti karakteristični oblik na prsima, plus bijele pruge na nogama. Hvala na sudjelovanju!',
      [PatchedUserRequestLocale.De]:
        'Sehr gutes Foto! Du hast es geschafft, dass man die Koreanische Buschmücke leicht identifizieren kann, denn man erkennt deutlich das charakteristischen Muster am Thorax, sowie auch die weißen Beinstreifen. Vielen Dank für deine Teilnahme!',
      [PatchedUserRequestLocale.Mk]:
        'Многу добра слика! Успеавте да го направите Aedes koreicus лесен за препознавање затоа што можете јасно да ја забележите карактеристичната форма во градниот кош и белите ленти на нозете. Ви благодариме за учеството!',
      [PatchedUserRequestLocale.El]:
        'Πολύ καλή φωτογραφία! Καταφέρατε να μας βοηθήσετε να ταυτοποιήσουμε εύκολα ότι πρόκειται για το είδος Aedes koreicus. Η ταυτοποίηση βασίστηκε στο γεγονός ότι στη φωτογραφία σας φαίνονται ξεκάθαρα όλα τα χαρακτηριστικά που απαιτούνται για τη σωστή αναγνώρισή του και ειδικά το χαρακτηριστικό σχήμα στο θώρακα του καθώς και οι λευκές λωρίδες στα πόδια. Σας ευχαριστούμε και συνεχίστε να μας στέλνετε τις φωτογραφίες σας!',
      [PatchedUserRequestLocale.Pt]:
        'Foto muito boa! Conseguiu fazer com que o Aedes koreicus fosse fácil de identificar porque se consegue perceber claramente a forma característica no tórax, além das listras brancas da perna. Obrigado por participar!',
      [PatchedUserRequestLocale.Ro]:
        'Imagine foarte bună! Ați reușit să faceți Aedes koreicus ușor de identificat, deoarece se poate observa clar forma caracteristică din torace, plus dungile albe ale picioarelor. Vă mulțumim pentru participare!',
      [PatchedUserRequestLocale.Sr]:
        'Vrlo dobra fotografija. Vašom fotografijom omogućili ste nam veoma laku identifikaciju korejskog komarca, jer su karakteristične šare na leđima ove vrste jasno vidljive, kao i beli prstenovi na nogama. Hvala Vam na učešću.',
      [PatchedUserRequestLocale.Sl]:
        'Zelo dobra fotografija! Iz nje je korejskega komarja lahko prepoznati, saj se dobro vidijo tipični znaki - bel vzorec oprsju ter črte na nogah. Hvala za sodelovanje!',
      [PatchedUserRequestLocale.Ca]:
        "Molt bona foto! Has aconseguit que l'Aedes koreicus sigui fàcil d'identificar ja que es pot observar clarament la característica forma en el tòrax, a més de les franges blanques de les potes. Gràcies per participar!",
      [PatchedUserRequestLocale.Bg]:
        'Много добра снимка! Успяхте да улесните разпознаването на Aedes koreicus, защото може ясно да се види характерната шарка на гърба, заедно с белите ивици на крака. Благодарим за участието!',
      [PatchedUserRequestLocale.Fr]:
        'Très belle image! Vous avez réussi à rendre facile à identifier cet Aedes koreicus puisque le typique dessin sur le thorax est bien visible, en plus des pattes ornées de franges blanches. Merci de votre participation!',
      [PatchedUserRequestLocale.Nl]:
        'Een erg goede foto! De door u gefotografeerde Aedes koreicus mug was makkelijk te identificeren, de karakteristieke vorm op het borststuk en de gestreepte poten waren duidelijk zichtbaar. Bedankt voor uw deelname!',
      [PatchedUserRequestLocale.Hu]:
        'Nagyon jó kép! Sikerült könnyen azonosítani a koreia szúnyogot, mert a tor jellegzetes mintázata és a lábakon lévő fehér gyűrűk jól látszanak. Köszönjük a részvételt!',
      [PatchedUserRequestLocale.Sv]:
        'Mycket bra bild! Du har lyckats göra det lätt att identifiera Aedes koreicus eftersom man tydligt kan se det karaktäristiska mönstret på mellankroppen och benen med vita ränder. Tack för ditt deltagande!',
    },
    false: {
      [PatchedUserRequestLocale.Es]:
        'Con esta foto no podemos asegurar totalmente que sea un Aedes koreicus. No se ve bien la forma característica del tórax y las rayas blancas en las patas, aunque se aprecian otras características típicas del Aedes koreicus. Aun así, tu observación sigue siendo muy útil. En www.mosquitoalert.com encontrarás trucos para atrapar y fotografiar estos insectos. ¡Envía más fotos!',
      [PatchedUserRequestLocale.Gl]:
        'Con esta foto non podemos asegurar totalmente que sexa un Aedes koreicus. Non se ve ben a forma característica do tórax e as raias brancas nas patas, aínda que se aprecian outras características típicas do Aedes koreicus. Aínda así, a túa observación segue sendo moi útil. En www.mosquitoalert.com atoparás trucos para atrapar e fotografar estes insectos. Envía máis fotos!',
      [PatchedUserRequestLocale.En]:
        "With this picture, we can't be completely sure that it's an Aedes koreicus mosquito. You can't simultaneously see the thorax pattern and the leg stripes, but you can see other typical traits of Aedes koreicus.  Still, your observation is very useful. At www.mosquitoalert.com you will find tricks and tips for catching and photographing these insects. Please send more pictures!",
      [PatchedUserRequestLocale.It]:
        'Con questa immagine, non possiamo essere completamente sicuri che sia una Aedes koreicus. Non è possibile visualizzare abbastanza caratteristiche, sebbene siano presenti altri tratti tipici della specie. Tuttavia, la tua osservazione è molto utile. Su www.mosquitoalert.com troverai soluzioni e suggerimenti per catturare e fotografare questi insetti. Ti preghiamo di inviare altre foto!',
      [PatchedUserRequestLocale.Sq]:
        'Me këtë fotografi, nuk mund të jemi plotësisht të sigurt se është një mushkonjë Aedes koreicus. Ju nuk mund të shihni njëkohësisht karakteristikat e kraharorit dhe shiritat e këmbëve, por ju mund të shihni tipare të tjera tipike të Aedes koreicus. Megjithatë, vëzhgimi juaj është shumë i dobishëm. Në www.mosquitoalert.com do të gjeni truke dhe këshilla për kapjen dhe fotografimin e këtyre insekteve. Ju lutemi dërgoni më shumë fotografi!',
      [PatchedUserRequestLocale.Hr]:
        'Na ovoj slici ne možemo sa sigurnošću tvrditi da se radi o komarcu Aedes koreicus. Ne može se istovremeno vidjeti uzorak prsa i pruge na nogama, ali se mogu vidjeti druge tipične osobine Aedes koreicus. Ipak, vaše je zapažanje vrlo korisno. Na www.mosquitoalert.com pronaći ćete  savjete za hvatanje i fotografiranje komaraca. Molimo pošaljite još slika!',
      [PatchedUserRequestLocale.De]:
        'Bei diesem Foto können wir nicht ganz sicher sein, dass es sich um eine Koreanische Buschmücke handelt. Man kann nicht beides, das Thoraxmuster und auch die Beinstreifen erkennen, aber man kann andere typische Merkmale der Koreanischen Buschmücke sehen. Trotzdem ist deine Beobachtung sehr nützlich. Unter www.mosquitoalert.com findest du Tricks und Tipps zum Fangen und Fotografieren dieser Insekten. Bitte sende weitere Fotos!',
      [PatchedUserRequestLocale.Mk]:
        'Со оваа слика, не можеме да бидеме потполно сигурни дека станува збор за комарецот Aedes koreicus. Не може истовремено да се види шемата на градниот кош и лентите на нозете, но може да се забележат останатите типични карактеристики. Сепак, Вашето набудување е многу корисно. На www.mosquitoalert.com ќе најдете трикови и совети за фаќање и фотографирање на овие инсекти. Ве молиме, испратете повеќе слики!',
      [PatchedUserRequestLocale.El]:
        "Με τη συγκεκριμένη φωτογραφία δεν μπορούμε να ταυτοποιήσουμε με αξιοπιστία αν πρόκειται για το κουνούπι Aedes koreicus. Βασικά χαρακτηριστικά του, όπως το σχήμα στο θώρακα και οι λευκές λωρίδες στα πόδια, δεν είναι ευδιάκριτα. Παρ' όλα αυτά, η παρατήρησή σας κρίνεται πολύ χρήσιμη. Για διευκόλυνσή σας, στη σελίδα www.mosquitoalert.com θα βρείτε όλες τις απαραίτητες πληροφορίες που απαιτούνται για να φωτογραφίσετε σωστά τα κουνούπια. Σας ευχαριστούμε και συνεχίστε να μας στέλνετε τις φωτογραφίες σας!",
      [PatchedUserRequestLocale.Pt]:
        'Com esta foto, não podemos ter certeza de que é um mosquito Aedes koreicus. Não se consegue ver simultaneamente o padrão do tórax e as listras nas pernas, mas podem-se visualizar outras características típicas do Aedes koreicus. Ainda assim, a sua observação é muito útil. Em www.mosquitoalert.com vai encontrar truques e dicas para capturar e fotografar estes insetos. Por favor, envie mais fotos!',
      [PatchedUserRequestLocale.Ro]:
        'Cu această imagine nu putem fi complet siguri că este un țânțar Aedes koreicus. Nu se vede simultan modelul toracelui și dungile picioarelor, dar se pot observa alte trăsături tipice ale lui Aedes koreicus. Totuși, observația dvs. este foarte utilă. La www.mosquitoalert.com veți găsi trucuri și sfaturi pentru prinderea și fotografierea acestor insecte. Vă rugăm să trimiteți mai multe poze!',
      [PatchedUserRequestLocale.Sr]:
        'Vaša fotografija ne omogućava da sa sigurnošću potvrdimo da je reč o korejskom komarcu (Aedes koreicus). Nisu vidljive tipične šare na leđnoj strani (na toraksu) i prstenovi na nogama, ali ostale tipične šare ukazuju na ovu vrstu komarca. U svakom slučaju, Vaš nalaz je veoma koristan. Na www.mosquitoalert.com pronaći ćete savete i trikove za hvatanje i fotografisanje ovih insekata. Molimo Vas da nam pošaljete više fotografija.',
      [PatchedUserRequestLocale.Sl]:
        'Nismo popolnoma prepričani, da je na fotografiji korejskikomar. Tipičen vzorec na oprsju in črte na nogah niso dobro vidne, so pa vidne druge lastnosti korejskih komarjev. Kljub temu je vaše opažanje zelo koristno. Na www.mosquitoalert.com boste našli trike in nasvete za lovljenje in fotografiranje teh žuželk. Prosimo, pošljite več slik!',
      [PatchedUserRequestLocale.Ca]:
        "Amb aquesta foto, no podem estar completament segurs que es tracta d'un mosquit Aedes koreicus. No es pot veure al mateix temps el patró en el tòrax i les franges de les potes, però sí que es veuen altres característiques d'Aedes koreicus. Tot i així, la teva observació és molt útil. A www.mosquitoalert.com trobaràs trucs per reconèixer aquestes espècies i caçar i fotografiar aquests insectes. Si et plau envia més fotos!",
      [PatchedUserRequestLocale.Bg]:
        'От тази снимка не можем да бъдем напълно сигурни, че става дума за комара Aedes koreicus. Не могат едновременно да се видят шарката на гърба и ивиците на краката, но могат да се видят други характерни белези на Aedes koreicus. Все пак, наблюдението Ви е много полезно. На www.mosquitoalert.com ще намерите съвети за улавяне и фотографиране на тези насекоми. Моля, изпращайте още снимки!',
      [PatchedUserRequestLocale.Fr]:
        "Sur cette image nous ne pouvons pas assurer tout à fait qu'il s'agisse d'un Aedes koreicus. Le dessin sur le thorax n'est pas visible en même temps que les pattes ornées de franges blanches. Toutefois, votre observation est utile. Sur www.mosquitoalert.com vous rencontrerez des astuces et des conseils pour capturer et photographier ces insectes. Envoyez encore des photos s'il vous plaît!",
      [PatchedUserRequestLocale.Nl]:
        "Met deze foto kunnen we niet vaststellen of het om een Aedes koreicus mug gaat. De typische markeringen op het borststuk en de gestreepte poten zijn niet beiden zichtbaar. Toch is uw observatie erg nuttig. Op www.mosquitoalert.com vind u tips en tricks voor het vangen en fotograferen van deze insecten. Blijf alstublieft foto's insturen!",
      [PatchedUserRequestLocale.Hu]:
        'Sajnos ezzel a képpel nem lehetünk biztosak abban, hogy ez egy koreai szúnyog. Nem látható a tor jellegzetes mintázata és a lábak gyűrűi, de a koreai szúnyog más tipikus karakterei látszanak. Ennek ellenére, a megfigyelésed nagyon hasznos számunkra. A www.mosquitoalert.com oldalon találsz különböző tippeket és trükköket a szúnyogok megfogására és fotózására. Kérünk, küldj további képeket!',
      [PatchedUserRequestLocale.Sv]:
        'Med denna bild kan vi inte vara helt säkra på att det är en Aedes koreicus mygga. Man kan inte samtidigt se både mönstret på mellankroppen och ränderna på benen, men man kan se andra typiska karaktärer hos Aedes koreicus. Din observation är dock ändå väldigt användbar. På www.mosquitoalert.com kan du hitta tips på hur man fångar och fotograferar dessa insekter. Skicka gärna fler bilder!',
    },
  },
  10: {
    // Culex
    true: {
      [PatchedUserRequestLocale.Es]:
        'Muy buena foto! Has conseguido que este mosquito común sea fácilmente identificable. ¡Gracias por participar!',
      [PatchedUserRequestLocale.Gl]:
        'Moi boa foto! Conseguiches que este mosquito común sexa facilmente identificable. Grazas por participar!',
      [PatchedUserRequestLocale.En]:
        'Very good picture! You have managed to make the common house mosquito quite easy to identify. Thanks for participating!',
      [PatchedUserRequestLocale.It]:
        'Ottima immagine! Sei riuscito a rendere la zanzara comune abbastanza facile da identificare. Grazie per aver partecipato!',
      [PatchedUserRequestLocale.Sq]:
        'Foto shume e mire! Ju keni arritur ta bëni mushkonjën e zakonshme të shtëpisë mjaft të lehtë për t’u identifikuar. Faleminderit për pjesëmarrjen!',
      [PatchedUserRequestLocale.Hr]:
        'Vrlo dobra slika! Uspjeli ste olakšati determinaciju običnog kućnog komarca. Hvala na sudjelovanju!',
      [PatchedUserRequestLocale.De]:
        'Sehr gutes Foto! Du hast es geschafft, dass man die Gemeine Stechmücke leicht identifizieren kann. Vielen Dank für deine Teilnahme!',
      [PatchedUserRequestLocale.Mk]:
        'Многу добра слика! Успеавте да го направите вообичаениот домашен комарец лесен за препознавање. Ви благодариме за учеството!',
      [PatchedUserRequestLocale.El]:
        'Πολύ καλή φωτογραφία! Καταφέρατε να μας βοηθήσετε να ταυτοποιήσουμε εύκολα ότι πρόκειται για το κοινό κουνούπι! Σας ευχαριστούμε και συνεχίστε να μας στέλνετε τις φωτογραφίες σας!',
      [PatchedUserRequestLocale.Pt]:
        'Foto muito boa! Conseguiu tornar o mosquito doméstico comum bastante fácil de identificar. Obrigado por participar!',
      [PatchedUserRequestLocale.Ro]:
        'Imagine foarte bună! Ai reușit să faci pe țânțarul comun să fie destul de ușor de identificat. Vă mulțumim pentru participare!',
      [PatchedUserRequestLocale.Sr]:
        'Vrlo dobra fotografija. Vašom fotografijom omogućili ste nam veoma laku identifikaciju domaće vrste kućnog komarca. Hvala Vam na učešću.',
      [PatchedUserRequestLocale.Sl]:
        'Zelo dobra fotografija! Iz nje je navadnega komarja lahko prepoznati, saj se dobro vidijo tipični znaki. Hvala za sodelovanje!',
      [PatchedUserRequestLocale.Ca]:
        "Molt bona foto! Has aconseguit que el mosquit comú sigui fàcil d'identificar. Gràcies per participar!",
      [PatchedUserRequestLocale.Bg]:
        'Много добра снимка! Успяхте да улесните разпознаването на обикновения домашен комар. Благодарим за участието!',
      [PatchedUserRequestLocale.Fr]:
        'Très belle image! Vous avez réussi à rendre facile à identifier ce moustique commun. Merci de votre participation!',
      [PatchedUserRequestLocale.Nl]:
        'Een erg goede foto! De door u gefotografeerde huissteekmug was makkelijk te identificeren. Bedankt voor uw deelname!',
      [PatchedUserRequestLocale.Hu]:
        'Nagyon jó kép! Sikerült könnyen azonosítani a dalos szúnyogot. Köszönjük a részvételt!',
      [PatchedUserRequestLocale.Sv]:
        'Mycket bra bild! Du har lyckats göra det lätt att identifiera husmyggan. Tack för ditt deltagande!',
    },
    false: {
      [PatchedUserRequestLocale.Es]:
        'Con esta foto no podemos asegurar totalmente que sea un Culex. No pueden verse simultáneamente suficientes rasgos, aunque algunas características del mosquito común están presentes. Aun así, tu observación sigue siendo muy útil. En www.mosquitoalert.com encontrarás trucos para atrapar y fotografiar estos insectos. ¡Envía más fotos!',
      [PatchedUserRequestLocale.Gl]:
        'Con esta foto non podemos asegurar totalmente que sexa un Culex. Non poden verse simultaneamente suficientes trazos, aínda que algunhas características do mosquito común están presentes. Aínda así, a túa observación segue sendo moi útil. En www.mosquitoalert.com atoparás trucos para atrapar e fotografar estes insectos. Envía máis fotos!',
      [PatchedUserRequestLocale.En]:
        "With this picture, we can't be completely sure that it's an Culex mosquito. You can't simultaneously see enough features, though other typical traits of the common house mosquito are present.  Still, your observation is very useful. At www.mosquitoalert.com you will find tricks and tips for catching and photographing these insects. Please send more pictures!",
      [PatchedUserRequestLocale.It]:
        'Con questa immagine, non possiamo essere completamente sicuri che sia una zanzara comune. Non è possibile visualizzare abbastanza caratteristiche, sebbene siano presenti altri tratti tipici della zanzara comune. Tuttavia, la tua osservazione è molto utile. Su www.mosquitoalert.com troverai soluzioni e suggerimenti per catturare e fotografare questi insetti. Ti preghiamo di inviare altre foto!',
      [PatchedUserRequestLocale.Sq]:
        'Me këtë fotografi, nuk mund të jemi plotësisht të sigurt se është një mushkonjë Culex. Ju nuk mund të shihni njëkohësisht mjaft karakteristika, megjithëse tipare të tjera tipike të mushkonjës së zakonshme të shtëpisë  janë të pranishme. Megjithatë, vëzhgimi juaj është shumë i dobishëm. Në www.mosquitoalert.com do të gjeni truke dhe këshilla për kapjen dhe fotografimin e këtyre insekteve. Ju lutemi dërgoni më shumë fotografi!',
      [PatchedUserRequestLocale.Hr]:
        'Na ovoj slici ne možemo odrediti sa sigurnošću da se radi o komarcu Culex. Ne može se  vidjeti dovoljno obilježja, iako su prisutne neke tipične osobine običnog kućnog komarca. Ipak, vaše je promatranje vrlo korisno. Na www.mosquitoalert.com pronaći ćete savjete za hvatanje i fotografiranje komaraca. Molimo Vas pošaljite još slika!',
      [PatchedUserRequestLocale.De]:
        'Bei diesem Foto können wir nicht ganz sicher sein, dass es sich um eine Stechmücke der Gattung Culex handelt. Man kann nicht genügend Merkmale erkennen, auch wenn einige der typischen Merkmale zu sehen sind. Trotzdem ist deine Beobachtung sehr nützlich. Unter www.mosquitoalert.com findest du Tricks und Tipps zum Fangen und Fotografieren dieser Insekten. Bitte sende weitere Fotos!',
      [PatchedUserRequestLocale.Mk]:
        'Со оваа слика, не можеме да бидеме целосно сигурни дека станува збор за домашниот комарец Culex. Не се забележуваат доволно карактеристики, иако се присутни и други типични црти на овој вид комарец. Сепак, Вашето набљудување е многу корисно. На www.mosquitoalert.com ќе најдете трикови и совети за фаќање и фотографирање на овие инсекти. Ве молиме, испратете повеќе слики!',
      [PatchedUserRequestLocale.El]:
        'Με τη συγκεκριμένη φωτογραφία δεν μπορούμε να ταυτοποιήσουμε με αξιοπιστία αν πρόκειται για κάποιο είδος κουνουπιου που ανήκει στο γένος Culex.  Για διευκόλυνσή σας, στη σελίδα www.mosquitoalert.com θα βρείτε όλες τις απαραίτητες πληροφορίες που απαιτούνται για να φωτογραφίσετε σωστά τα κουνούπια. Σας ευχαριστούμε και συνεχίστε να μας στέλνετε τις φωτογραφίες σας!',
      [PatchedUserRequestLocale.Pt]:
        'Com esta foto, não podemos ter certeza de que é um mosquito Culex. Não é possível visualizar simultaneamente características suficientes, embora outras características típicas do mosquito doméstico comum estejam presentes. Ainda assim, a sua observação é muito útil. Em www.mosquitoalert.com vai encontrar truques e dicas para capturar e fotografar estes  insetos. Por favor, envie mais fotos!',
      [PatchedUserRequestLocale.Ro]:
        'Cu această imagine nu putem fi complet siguri că specimenul este un țânțar Culex. Nu se văd simultan suficiente caracteristici, deși sunt prezente și alte trăsături tipice ale țânțarului comun. Totuși, observația dvs. este foarte utilă. La www.mosquitoalert.com veți găsi trucuri și sfaturi pentru prinderea și fotografierea acestor insecte. Vă rugăm să trimiteți mai multe poze!',
      [PatchedUserRequestLocale.Sr]:
        'Vaša fotografija ne omogućava da sa sigurnošću potvrdimo da je reč o kućnom komarcu (Culex). Nije vidljiv dovoljan broj karaktera ove vrste, iako vidljive ostale karakteristike ukazuju na ovu vrstu komarca. U svakom slučaju, Vaš nalaz je veoma koristan. Na www.mosquitoalert.com pronaći ćete savete i trikove za hvatanje i fotografisanje ovih insekata. Molimo Vas da nam pošaljete više fotografija.',
      [PatchedUserRequestLocale.Sl]:
        'Nismo popolnoma prepričani, da je na fotografiji navadni komar, saj niso dobro vidne vse lastnosti navadnih komarjev. Kljub temu je vaše opažanje zelo koristno. Na www.mosquitoalert.com boste našli trike in nasvete za lovljenje in fotografiranje teh žuželk. Prosimo, pošljite več slik!',
      [PatchedUserRequestLocale.Ca]:
        "Amb aquesta foto, no podem estar completament segurs que es tracta d'un mosquit Culex. No es poden veure suficients característiques al mateix temps, tot i que sí que es poden veure altres trets típics del mosquit comú. Tot i així, la teva observació és molt útil. A www.mosquitoalert.com trobaràs trucs per reconèixer aquestes espècies i caçar i fotografiar aquests insectes. Si et plau envia més fotos!",
      [PatchedUserRequestLocale.Bg]:
        'От тази снимка не можем да бъдем напълно сигурни, че става дума за комар Culex. Не могат едновременно да се видят достатъчно белези, въпреки че присъстват и други характерни белези на обикновения домашен комар. Все пак, наблюдението Ви е много полезно. На www.mosquitoalert.com ще намерите съвети за улавяне и фотографиране на тези насекоми. Моля, изпращайте още снимки!',
      [PatchedUserRequestLocale.Fr]:
        "Sur cette image nous ne pouvons pas assurer tout à fait qu'il s'agisse d'un moustique Culex. Un nombre insuffisant de traits morphologiques y est visible, bien que certains d'autres, propres au moustique commun, y sont bien présents. Toutefois, votre observation est utile. Sur www.mosquitoalert.com vous rencontrerez des astuces et des conseils pour capturer et photographier ces insectes. Envoyez encore des photos s'il vous plaît!",
      [PatchedUserRequestLocale.Nl]:
        "Met deze foto kunnen we niet vaststellen of het om een huissteekmug gaat. Er zijn niet genoeg kenmerken van de huissteekmug zichtbaar. Toch is uw observatie erg nuttig. Op www.mosquitoalert.com vind u tips en tricks voor het vangen en fotograferen van deze insecten. Blijf alstublieft foto's insturen!",
      [PatchedUserRequestLocale.Hu]:
        'Sajnos ezzel a képpel nem lehetünk biztosak abban, hogy ez egy dalos szúnyog. Nem látható egyszerre elég jellemvonás, bár a dalos szúnyog általános karakterei megfigyelhetőek. Ennek ellenére, a megfigyelésed nagyon hasznos számunkra. A www.mosquitoalert.com oldalon találsz különböző tippeket és trükköket a szúnyogok megfogására és fotózására. Kérünk, küldj további képeket!',
      [PatchedUserRequestLocale.Sv]:
        'Med denna bild kan vi inte vara helt säkra på att det är en Culexmygga. Man kan inte se tillräckligt många karaktärer samtidigt, även om man kan se några typiska karaktärer hos husmyggan. Din observation är dock ändå väldigt användbar. På www.mosquitoalert.com kan du hitta tips på hur man fångar och fotograferar dessa insekter. Skicka gärna fler bilder!',
    },
  },
  7: {
    // Culicidae
    true: {
      [PatchedUserRequestLocale.Es]:
        '¡Muy buena foto! Has conseguido que se pueda identificar perfectamente al mosquito ya que se ven muy bien sus características típicas. ¡Gracias por participar!',
      [PatchedUserRequestLocale.Gl]:
        'Moi boa foto! Conseguiches que se poida identificar perfectamente o mosquito xa que se ven moi ben as súas características típicas. Grazas por participar!',
      [PatchedUserRequestLocale.En]:
        'Very good picture! You have managed to make the mosquito easily to identify because you can spot clearly the characteristic traits of the species. Thanks for participating!',
      [PatchedUserRequestLocale.It]:
        'Ottima immagine! Sei riuscito a rendere la zanzara facile da identificare perché si possono individuare chiaramente i tratti caratteristici della specie. Grazie per aver partecipato!',
      [PatchedUserRequestLocale.Sq]:
        'Fotografi shumë e mirë! Keni arritur ta bëni të lehtë identifikimin e mushkonjës, sepse mund të dallohen qartë tiparet karakteristike të llojeve. Faleminderit për pjesëmarrjen!',
      [PatchedUserRequestLocale.Hr]:
        'Vrlo dobra slika! Omogućili ste laku determinaciju komarca jer se mogu jasno uočiti karakteristike vrste. Hvala na sudjelovanju!',
      [PatchedUserRequestLocale.De]:
        'Sehr gutes Foto! Du hast es geschafft, dass man die Stechmücke leicht identifizieren kann, da man deutlich die charakteristischen Merkmale der Art erkennen kann. Vielen Dank für deine Teilnahme!',
      [PatchedUserRequestLocale.Mk]:
        'Многу добра слика! Успеавте да го направите комарецот лесен за препознавање затоа што јасно можат да се забележат карактеристичните одлики на видот. Ви благодариме за учеството!',
      [PatchedUserRequestLocale.El]:
        'Πολύ ωραία φωτογραφία! Κατάφερες να μας διευκολύνεις στην αναγνώριση του είδους διότι φαίνονται ξεκάθαρα όλα εκείνα τα χαρακτηριστικά του κουνουπιού που απαιτούνται για μια σωστή ταυτοποίηση! Σας ευχαριστούμε πολύ για τη συμμετοχή σας!',
      [PatchedUserRequestLocale.Pt]:
        'Foto muito boa! Conseguiu fazer com que o mosquito se identificasse facilmente porque se consegue visualizar claramente os traços característicos da espécie. Obrigado por participar!',
      [PatchedUserRequestLocale.Ro]:
        'Imagine foarte bună! Ați reușit să faceți ca țânțarul să se identifice cu ușurință, deoarece se văd clar trăsăturile caracteristice ale speciei. Vă mulțumim pentru participare!',
      [PatchedUserRequestLocale.Sr]:
        'Vrlo dobra fotografija. Vašom fotografijom omogućili ste nam veoma laku identifikaciju vrste, jer su sve karakteristike ove vrste jasno vidljive. Hvala Vam na učešću.',
      [PatchedUserRequestLocale.Sl]:
        'Zelo dobra fotografija! Iz nje se dobro bidi vse podrobnosti vrste in je zato komarja lahko določiti. Hvala za sodelovanje!',
      [PatchedUserRequestLocale.Ca]:
        "Molt bona foto! Has aconseguit que el mosquit sigui fàcil d'identificar ja que es poden observar clarament els trets característics de l'espècie. Gràcies per participar!",
      [PatchedUserRequestLocale.Bg]:
        'Много добра снимка! Успяхте да улесните разпознаването на комара, защото могат ясно да се видят характерните белези на вида. Благодарим за участието!',
      [PatchedUserRequestLocale.Fr]:
        "Très bonne image! Vous avez réussi à rendre le moustique facile à identifier puisque les détails typiques de l'espèce sont bien visibles. Merci de votre participation!",
      [PatchedUserRequestLocale.Nl]:
        'Een erg goede foto! De mug is makkelijk te identificeren omdat de karakteristieke kenmerken van deze soort goed zichtbaar zijn. Bedankt voor uw deelname!',
      [PatchedUserRequestLocale.Hu]:
        'Nagyon jó kép! Ez alapján sikerült könnyen felismerni a szúnyogot, mert világosan észrevehetőek a faj jellemző vonásai. Köszönjük a részvételt!',
      [PatchedUserRequestLocale.Sv]:
        'Mycket bra bild! Du har lyckats göra myggan lätt att identifiera eftersom man tydlig kan se de artspecifika karaktärerna. Tack för ditt deltagande!',
    },
    // [PictureCategory.PatternOfSpeciesFound]: {
    //   [PatchedUserRequestLocale.Es]:
    //     'La foto es espectacular y se ven muchos detalles del cuerpo del mosquito. Gracias por participar. ¡Gran trabajo!',
    //   [PatchedUserRequestLocale.Gl]:
    //     'A foto é espectacular e vense moitos detalles do corpo do mosquito. Grazas por participar. Gran traballo!',
    //   [PatchedUserRequestLocale.En]:
    //     'The picture is spectacular as you can see a lot of details of the mosquito body. Thanks for participating. Great job!',
    //   [PatchedUserRequestLocale.It]:
    //     "L'immagine è spettacolare perché si possono vedere molti dettagli del corpo della zanzara. Grazie per aver partecipato. Ottimo lavoro!",
    //   [PatchedUserRequestLocale.Sq]:
    //     'Fotografia është e mahnitshme sepse mund të shihen shumë detaje të trupit të mushkonjës. Faleminderit për pjesëmarrjen. Punë e shkëlqyer!',
    //   [PatchedUserRequestLocale.Hr]:
    //     'Slika je uvjerljiva jer je vidljivo puno detalja na tijelu komarca. Hvala na sudjelovanju. Odličan posao!',
    //   [PatchedUserRequestLocale.De]:
    //     'Dieses Foto ist großartig, da viele Details der Stechmücke zu erkennen sind. Vielen Dank für deine Teilnahme. Toll gemacht!',
    //   [PatchedUserRequestLocale.Mk]:
    //     'Сликата е одлична бидејќи може да видите многу детали од телото на комарецот. Ви благодариме за учеството. Одлична работа!',
    //   [PatchedUserRequestLocale.El]:
    //     'Η φωτογραφία είναι καταπληκτική! Μπορείς να δεις πολλές λεπτομέρειες στο σώμα του κουνουπιού! Σας ευχαριστούμε για τη συμμετοχή σας! Πολύ καλή δουλειά!',
    //   [PatchedUserRequestLocale.Pt]:
    //     'A imagem é espetacular, pois podem ver-se muitos detalhes do corpo do mosquito. Obrigado por participar. Bom trabalho!',
    //   [PatchedUserRequestLocale.Ro]:
    //     'Imaginea este spectaculoasă, deoarece se pot observa o mulțime de detalii despre corpul țânțarului. Vă mulțumim pentru participare. Bună treabă!',
    //   [PatchedUserRequestLocale.Sr]:
    //     'Ova fotografija je spektakularna jer se na njoj vide mnogi detalji insekatskog tela. Hvala na učešću. Odlično urađeno!',
    //   [PatchedUserRequestLocale.Sl]:
    //     'Ta fotografija je odlična, saj se vidi vse podrobnosti na telesu komarja. Hvala za soedlovanje. Odlično opravljeno delo!',
    //   [PatchedUserRequestLocale.Ca]:
    //     'La foto és espectacular i es poden veure molts detalls del cos del mosquit. Gràcies per participar. Bona feina!',
    //   [PatchedUserRequestLocale.Bg]:
    //     'Снимката е чудесна, тъй като могат да се видят много подробности по тялото на комара. Благодарим за участието. Добра работа!',
    //   [PatchedUserRequestLocale.Fr]:
    //     'La photo est spectaculaire et montre beaucoup de détails du corps du moustique. Merci de votre participation. Très bien fait!',
    //   [PatchedUserRequestLocale.Nl]:
    //     'Dit is een erg mooie foto omdat er veel details zichtbaar zijn op het lichaam van de mug. Bedankt voor uw deelname. Goed werk!',
    //   [PatchedUserRequestLocale.Hu]:
    //     'Nagyon jó és látványos kép, mivel a szúnyog testének sok részlete látszik rajta. Köszönjük a részvételt! Nagyszerű munka!',
    //   [PatchedUserRequestLocale.Sv]:
    //     'Denna bild är enastående eftersom man kan se många detaljer på myggans kropp. Tack för ditt deltagande. Jättebra jobbat!',
    // },
    false: {
      [PatchedUserRequestLocale.Es]:
        'Con esta foto no podemos asegurar totalmente la especie del mosquito. No se aprecian lo suficientemente bien las características típicas. Aun así, tu observación sigue siendo muy útil. En www.mosquitoalert.com encontrarás trucos para atrapar y fotografiar estos insectos. ¡Envía más fotos!',
      [PatchedUserRequestLocale.Gl]:
        'Con esta foto non podemos asegurar totalmente a especie do mosquito. Non se aprecian suficientemente ben as características típicas. Aínda así, a túa observación segue sendo moi útil. En www.mosquitoalert.com encontrarás trucos para atrapar e fotografar estes insectos. Envía máis fotos!',
      [PatchedUserRequestLocale.En]:
        "With this picture, we can't be completely sure of the mosquito species. You can't see well enough the typical traits.  Still, your observation is very useful. At www.mosquitoalert.com you will find tricks and tips for catching and photographing these insects. Please send more pictures!",
      [PatchedUserRequestLocale.It]:
        'Con questa immagine, non si riesce a identificare con sicurezza la specie di zanzara. Non si vedono abbastanza chiaramente i tratti tipici. Tuttavia, la tua osservazione è molto utile. Su www.mosquitoalert.com troverai soluzioni e suggerimenti per catturare e fotografare questi insetti. Ti preghiamo di inviare altre foto!',
      [PatchedUserRequestLocale.Sq]:
        'Me këtë fotografi, nuk mund të jemi plotësisht të sigurt për llojet e mushkonjave. Nuk mund të shihen mirë tiparet e veçanta. Megjithatë, vëzhgimi juaj është shumë i dobishëm. Në www.mosquitoalert.com do të gjeni truke dhe këshilla për kapjen dhe fotografimin e këtyre insekteve. Ju lutemi dërgoni më shumë fotografi!',
      [PatchedUserRequestLocale.Hr]:
        'Na ovoj slici ne možemo točno odrediti vrstu komarca. Ne mogu se dobro vidjeti osnovne karakteristike vrste. Ipak, vaše je zapažanje vrlo korisno. Na www.mosquitoalert.com pronaći ćete  savjete za hvatanje i fotografiranje komaraca. Molimo pošaljite još slika!',
      [PatchedUserRequestLocale.De]:
        'Bei diesem Foto kann man sich nicht ganz sicher sein, um welche Stechmückenart es sich handelt. Man kann die typischen Merkmale nicht gut genug erkennen.  Trotzdem ist deine Beobachtung sehr nützlich. Unter www.mosquitoalert.com findest du Tricks und Tipps zum Fangen und Fotografieren dieser Insekten. Bitte sende weitere Fotos!',
      [PatchedUserRequestLocale.Mk]:
        'Со оваа слика, ние не можеме да бидеме целосно сигурни за видот на комарцот. Не можат да се видат доволно добро типичните карактеристики. Сепак, Вашето набљудување е многу корисно. На www.mosquitoalert.com ќе најдете трикови и совети за фаќање и фотографирање на овие инсекти. Ве молиме, испратете повеќе слики!',
      [PatchedUserRequestLocale.El]:
        "Μ' αυτή τη φωτογραφία δεν είμαστε σίγουροι για το είδος του κουνουπιού. Δε φαίνονται ξεκάθαρα ξεκάθαρα όλα εκείνα τα χαρακτηριστικά του κουνουπιού που απαιτούνται για μια σωστή ταυτοποίηση. Παρ' όλα αυτά, η παρατήρησή σας κρίνεται πολύ χρήσιμη. Για διευκόλυνσή σας, στη σελίδα www.mosquitoalert.com θα βρείτε όλες τις απαραίτητες πληροφορίες που απαιτούνται για να φωτογραφίσετε σωστά τα κουνούπια. Σας ευχαριστούμε και συνεχίστε να μας στέλνετε τις φωτογραφίες σας!",
      [PatchedUserRequestLocale.Pt]:
        'Com esta foto, não podemos ter certeza da espécie de mosquito. Não se consegue visualizar bem os traços típicos. Ainda assim, a sua observação é muito útil. Em www.mosquitoalert.com vai encontrar truques e dicas para capturar e fotografar estes insetos. Por favor, envie mais fotos!',
      [PatchedUserRequestLocale.Ro]:
        'Cu această fotografie nu putem asigura pe deplin specia de țânțar. Nu se pot vedea suficient de bine trăsăturile tipice. Totuși, observația dvs. este foarte utilă. La www.mosquitoalert.com veți găsi trucuri și sfaturi pentru prinderea și fotografierea acestor insecte. Vă rugăm să trimiteți mai multe poze!',
      [PatchedUserRequestLocale.Sr]:
        'Na osnovu ove fotografije ne možemo biti potpuno sigurni o kojoj vrsti komarca je reč. Ne vidi se dovoljan broj karakteristika U svakom slučaju, Vaš nalaz je veoma koristan. Na www.mosquitoalert.com pronaći ćete savete i trikove za hvatanje i fotografisanje ovih insekata. Molimo Vas da nam pošaljete više fotografija.',
      [PatchedUserRequestLocale.Sl]:
        'Iz te fotografije ni mogoče določiti vrste komarja, saj tipične lastnosti niso dobro vidne. Na www.mosquitoalert.com lahko najdete nekaj trikov in namigov za lov in fotografiranje teh žuželk. Prosimo, pošljite še kakšno sliko!',
      [PatchedUserRequestLocale.Ca]:
        'Amb aquesta foto, no podem estar completament segurs de quina espècie de mosquit es tracta. No podem veure prou clarament els seus trets típics. Tot i així, la teva observació és molt útil. A www.mosquitoalert.com trobaràs trucs per reconèixer aquestes espècies i caçar i fotografiar aquests insectes. Si et plau envia més fotos!',
      [PatchedUserRequestLocale.Bg]:
        'От тази снимка не можем да бъдем напълно сигурни за вида на комара.  Типичните белези не могат да се видят достатъчно добре. Все пак, наблюдението Ви е много полезно. На www.mosquitoalert.com ще намерите съвети за улавяне и фотографиране на тези насекоми. Моля, изпращайте още снимки!',
      [PatchedUserRequestLocale.Fr]:
        "Sur cette image nous ne pouvons pas assurer de quelle espèce il s'agit, puisque les détails nécéssaires ne sont pas suffisamment visibles. Toutefois, votre observation est utile.  Sur www.mosquitoalert.com vous rencontrerez des astuces et des conseils pour capturer et photographier ces insectes. Envoyez encore des photos s'il vous plaît!",
      [PatchedUserRequestLocale.Nl]:
        "Met deze foto kunnen we niet met zekerheid zeggen om welke muggensoort het gaat. De kenmerken zijn niet goed genoeg zichtbaar. Toch is uw observatie belangrijk. Op www.mosquitoalert.com vind u tips en tricks voor het vangen en fotograferen van deze insecten. Blijf alstublieft foto's insturen!",
      [PatchedUserRequestLocale.Hu]:
        'Sajnos ezzel a képpel nem lehetünk biztosak a szúnyog fajban. Nem látszanak eléggé a faj jellemző vonásai. Ennek ellenére, a megfigyelésed nagyon hasznos számunkra! A www.mosquitoalert.com oldalon találsz különböző tippeket és trükköket a szúnyogok megfogására és fotózására. Kérünk, küldj további képeket!',
      [PatchedUserRequestLocale.Sv]:
        'Med denna bild kan vi inte säkert säga vilken myggart det är. Man kan inte se de artspecifika karaktärerna bra nog. Din observation är dock ändå väldigt användbar. På www.mosquitoalert.com kan du hitta tips på hur man fångar och fotograferar dessa insekter. Skicka gärna fler bilder!',
    },
  },
  1: {
    // Insecta
    true: {
      [PatchedUserRequestLocale.Es]:
        'Esta foto muestra un insecto que no es un mosquito verdadero, es decir, no pertenece a la familia de los Culícidos. En www.mosquitoalert.com encontrarás trucos para reconocer estas especies y atrapar y fotografiar estos insectos. ¡Envía más fotos!',
      [PatchedUserRequestLocale.Gl]:
        'Esta foto mostra un insecto que non é un mosquito verdadeiro, é dicir, non pertence á familia dos Culícidos. En www.mosquitoalert.com atoparás trucos para recoñecer estas especies e atrapar e fotografar estes insectos. Envía máis fotos!',
      [PatchedUserRequestLocale.En]:
        'This picture shows an insect which is not a real mosquito from the Culicidae family. At www.mosquitoalert.com you will find tricks and tips for catching and photographing these insects. Please send more pictures!',
      [PatchedUserRequestLocale.It]:
        'Questa immagine mostra un insetto che non è una zanzara e non appartiene quindi alla famiglia dei Culicidi. Su www.mosquitoalert.com troverai soluzioni e suggerimenti per catturare e fotografare questi insetti. Si prega di inviare altre foto!',
      [PatchedUserRequestLocale.Sq]:
        'Kjo foto tregon një insekt i cili nuk është një mushkonjë nga familja Culicidae. Në www.mosquitoalert.com do të gjeni truke dhe këshilla për kapjen dhe fotografimin e këtyre insekteve. Ju lutemi dërgoni më shumë fotografi!',
      [PatchedUserRequestLocale.Hr]:
        'Ova slika prikazuje insekta koji nije pravi komarac iz obitelji Culicidae. Na www.mosquitoalert.com pronaći ćete trikove i savjete za hvatanje i fotografiranje ovih insekata. Molimo pošaljite još slika!',
      [PatchedUserRequestLocale.De]:
        'Dieses Foto zeigt ein Insekt, das keine echte Stechmücke aus der Familie der Culicidae ist. Unter www.mosquitoalert.com findest du Tricks und Tipps zum Fangen und Fotografieren dieser Insekten. Bitte sende weitere Fotos!',
      [PatchedUserRequestLocale.Mk]:
        'Оваа слика покажува инсект кој не е вистински комарец од фамилијата Culicidae. На www.mosquitoalert.com ќе најдете трикови и совети за фаќање и фотографирање на овие инсекти. Ве молиме, испратете повеќе слики!',
      [PatchedUserRequestLocale.El]:
        'Το έντομο της φωτογραφίας δεν ανήκει στα κουνούπια (οικογένεια Culicidae). Για διευκόλυνσή σας, στη σελίδα www.mosquitoalert.com θα βρείτε όλες τις απαραίτητες πληροφορίες που απαιτούνται για να φωτογραφίσετε σωστά τα κουνούπια. Σας ευχαριστούμε και συνεχίστε να μας στέλνετε τις φωτογραφίες σας!',
      [PatchedUserRequestLocale.Pt]:
        'Esta imagem mostra um inseto que não é um mosquito da família Culicidae. Em www.mosquitoalert.com vai encontrar truques e dicas para capturar e fotografar estes insetos. Por favor, envie mais fotos!',
      [PatchedUserRequestLocale.Ro]:
        'Această imagine arată o insectă care nu este un țânțar adevărat din familia Culicidae. La www.mosquitoalert.com veți găsi trucuri și sfaturi pentru prinderea și fotografierea acestor insecte. Vă rugăm să trimiteți mai multe poze!',
      [PatchedUserRequestLocale.Sr]:
        'Na fotografiji je insekt koji nije komarac iz familije Culicidae. Na www.mosquitoalert.com pronaći ćete savete i trikove za hvatanje i fotografisanje ovih insekata. Molimo Vas da nam pošaljete više fotografija.',
      [PatchedUserRequestLocale.Sl]:
        'Na tej fotografiji ni komar, temveč druga žuželka. Na www.mosquitoalert.com lahko najdete nekaj trikov in namigov za lov in fotografiranje teh žuželk. Prosim, pošljite še kakšno sliko!',
      [PatchedUserRequestLocale.Ca]:
        'Aquesta foto mostra un insecte que no pertany als veritables mosquits de la familia Culicidae. A www.mosquitoalert.com trobaràs trucs per reconèixer aquestes espècies i caçar i fotografiar aquests insectes. Si et plau envia més fotos!',
      [PatchedUserRequestLocale.Bg]:
        'На снимката е насекомо, което не е истински комар от семейство Culicidae. На www.mosquitoalert.com ще намерите съвети за улавяне и фотографиране на тези насекоми. Моля, изпращайте още снимки!',
      [PatchedUserRequestLocale.Fr]:
        "Cette image décrit un insecte qui n'est pas un vrai moustique appartenant à la famille des Culicidés. Sur www.mosquitoalert.com vous rencontrerez des astuces et des conseils pour capturer et photographier ces insectes. Envoyez encore des photos s'il vous plaît!",
      [PatchedUserRequestLocale.Nl]:
        "Het insect op deze foto is geen mug uit de Culicidae familie. Op www.mosquitoalert.com vind u tips en tricks voor het vangen en maken van foto's van deze insecten. Blijf alstublieft foto's insturen.",
      [PatchedUserRequestLocale.Hu]:
        'Ezen a képen egy olyan rovar látható, amely nem az igazi szúnyogok (Culicidae) családjába tartozik. A www.mosquitoalert.com oldalon találsz különböző tippeket és trükköket a szúnyogok megfogására és fotózására. Kérünk, küldj további képeket!',
      [PatchedUserRequestLocale.Sv]:
        'Denna bild visar en insekt som inte är en stickmygga från familjen Culicidae. På www.mosquitoalert.com kan du hitta tips på hur man fångar och fotograferar dessa insekter. Skicka gärna fler bilder!',
    },
    false: {
      [PatchedUserRequestLocale.Es]:
        'Con esta foto no podemos identificar ninguna especie, ya que está borrosa y no se reconocen las características típicas de ninguna de ellas. Aun así, tu observación sigue siendo útil. En www.mosquitoalert.com encontrarás trucos para atrapar y fotografiar estos insectos. ¡Envía más fotos!',
      [PatchedUserRequestLocale.Gl]:
        'Con esta foto non podemos identificar ningunha especie, xa que está borrosa e non se recoñecen as características típicas de ningunha delas. Aínda así, a túa observación segue sendo útil. En www.mosquitoalert.com atoparás trucos para atrapar e fotografiar estes insectos. Envía máis fotos!',
      [PatchedUserRequestLocale.En]:
        "With this picture we can't identify any mosquito species, because it's blurry and you can't recognize the typical traits of any of them. Still, your observation is very useful. At www.mosquitoalert.com you will find tricks and tips for catching and photographing these insects. Please send more pictures!",
      [PatchedUserRequestLocale.It]:
        'Con questa immagine non possiamo identificare nessuna specie di zanzara, perché è sfocata e non si possono riconoscere i tratti tipici per determinarla. Tuttavia, la tua osservazione è molto utile. Su www.mosquitoalert.com troverai soluzioni e suggerimenti per catturare e fotografare questi insetti. Ti preghiamo di inviare altre foto!',
      [PatchedUserRequestLocale.Sq]:
        'Me këtë fotografi nuk mund të identifikojmë ndonjë lloj mushkonje, sepse pamja është e zbehtë dhe nuk mund të dallohen tiparet e veçanta të ndonjërës prej tyre. Megjithatë, vëzhgimi juaj është shumë i dobishëm. Në www.mosquitoalert.com do të gjeni truke dhe sugjerime për fokusimin dhe fotografimin e këtyre insekteve. Ju lutem, dërgoni më shumë fotografi!',
      [PatchedUserRequestLocale.Hr]:
        'Na ovoj slici ne možemo determinirati niti jednu vrstu komaraca, jer je mutna i ne mogu se prepoznati osnovne karakteristike vrste. Ipak, vaše zapažanje je vrlo korisno. Na www.mosquitoalert.com pronaći ćete  savjete za hvatanje i fotografiranje komaraca. Molimo Vas pošaljite još slika!',
      [PatchedUserRequestLocale.De]:
        'Auf diesem Foto können wir keine Stechmückenart identifizieren, denn es ist unscharf und man kann die typischen Merkmale von keiner der Arten erkennen. Trotzdem ist deine Beobachtung sehr nützlich. Unter www.mosquitoalert.com findest du Tricks und Tipps zum Fangen und Fotografieren dieser Insekten. Bitte sende weitere Fotos!',
      [PatchedUserRequestLocale.Mk]:
        'Со оваа слика не можеме да идентификуваме ниту еден вид комарец, бидејќи е нејасен и не може да се препознаат типичните карактеристики на кој било од нив. Сепак, Вашето набљудување е многу корисно. На www.mosquitoalert.com ќе најдете трикови и совети за фаќање и фотографирање на овие инсекти. Ве молиме, испратете повеќе слики!',
      [PatchedUserRequestLocale.El]:
        "Με τη συγκεκριμένη φωτογραφία δυστυχώς το είδος του κουνουπιού δεν μπορεί να ταυτοποιηθεί. Είναι θαμπή και δεν είναι ευδιάκριτα όλα τα χαρακτηριστικά που απαιτούνται για μια σωστή ταυτοποίηση. Παρ' όλα αυτά, η παρατήρησή σας κρίνεται πολύ χρήσιμη. Για διευκόλυνσή σας, στη σελίδα www.mosquitoalert.com θα βρείτε όλες τις απαραίτητες πληροφορίες που απαιτούνται για να φωτογραφίσετε σωστά τα κουνούπια. Σας ευχαριστούμε και συνεχίστε να μας στέλνετε τις φωτογραφίες σας!",
      [PatchedUserRequestLocale.Pt]:
        'Com esta foto não conseguimos identificar a espécie de mosquito, porque está desfocada e não se conseguem reconhecer os traços típicos das espécies. Ainda assim, a sua observação é muito útil. Em www.mosquitoalert.com vai encontrar truques e dicas para poder capturar e fotografar estes insetos. Por favor, envie mais fotos!',
      [PatchedUserRequestLocale.Ro]:
        'Cu această poză nu putem identifica nicio specie de țânțar, deoarece este neclară și nu se poate recunoaște trăsăturile tipice. Totuși, observația dvs. este foarte utilă. La www.mosquitoalert.com veți găsi trucuri și sfaturi pentru prinderea și fotografierea acestor insecte. Vă rugăm să trimiteți mai multe poze!',
      [PatchedUserRequestLocale.Sr]:
        'Ova fotografija nam ne omogućava pouzdanu identifikaciju vrste komarca, jer je mutna i ne mogu se prepoznati karakteristične šare na telu komarca. U svakom slučaju, Vaš nalaz je veoma koristan. Na www.mosquitoalert.com pronaći ćete savete i trikove za hvatanje i fotografisanje ovih insekata. Molimo Vas da nam pošaljete više fotografija.',
      [PatchedUserRequestLocale.Sl]:
        'Iz te fotografije ne moremo določiti vrste komarjev, saj tipični znaki za določitev komarjev do vrste niso dobro razvidni. Vseeno je vaše opazovanje zelo koristno. Na www.mosquitoalert.com lahko najdete nekaj trikov in namigov za lov in fotografiranje teh žuželk. Prosimo, pošljite še kakšno sliko!',
      [PatchedUserRequestLocale.Ca]:
        "Amb aquesta foto no podem identificar cap espècie de mosquit, perquè està borrosa i no es reconeixen les característiques típiques de cap d'elles. Tot i així, la teva observació és molt útil. A www.mosquitoalert.com trobaràs trucs per reconèixer aquestes espècies i caçar i fotografiar aquests insectes. Si et plau envia més fotos!",
      [PatchedUserRequestLocale.Bg]:
        'С тази снимка не можем да идентифицираме нито един вид комари, защото е размазана и не могат да се разпознаят типичните белези на нито един от тях. Все пак, наблюдението Ви е много полезно. На www.mosquitoalert.com ще намерите съвети за улавяне и фотографиране на тези насекоми. Моля, изпращайте още снимки!',
      [PatchedUserRequestLocale.Fr]:
        "L'identification d'une espècie n'est pas possible sur cette image qui est trop floue et ne montre pas suffisamment de traits pour la reconnaître. Toutefois, votre observation est utile. Sur www.mosquitoalert.com vous rencontrerez des astuces et des conseils pour capturer et photographier ces insectes. Envoyez encore des photos s'il vous plaît!",
      [PatchedUserRequestLocale.Nl]:
        "We kunnen geen muggensoort identificeren met deze foto omdat de foto wazig is en de typische kenmerken om muggensoorten van elkaar te onderscheiden hierdoor niet zichtbaar zijn. Toch is deze observatie erg nuttig. Op www.mosquitoalert.com vind u tips en tricks voor het vangen en fotograferen van deze insecten. Blijf alstublieft foto's insturen!",
      [PatchedUserRequestLocale.Hu]:
        'Sajnos ezzel a képpel nem tudunk azonosítani egyetlen szúnyogfajt sem, mert homályos és nem ismerhetőek fel egyik faj jellemző tulajdonságai sem. Ennek ellenére, a megfigyelésed nagyon hasznos számunkra! A www.mosquitoalert.com oldalon találsz különböző tippeket és trükköket a szúnyogok megfogására és fotózására. Kérünk, küldj további képeket!',
      [PatchedUserRequestLocale.Sv]:
        'Med denna bild kan vi inte identifiera någon myggart eftersom den är suddig och man kan inte se några artspecifika karaktärer. Din observation är dock ändå väldigt användbar. På www.mosquitoalert.com kan du hitta tips på hur man fångar och fotograferar dessa insekter. Skicka gärna fler bilder!',
    },
  },
}

export function getPublicNote(
  taxon: Taxon,
  isHighConfidence: boolean,
  locale: PatchedUserRequestLocale,
): string {
  const key = String(isHighConfidence)
  const taxonAncestors: TaxonTreeNode[] = getTaxonAncestors(taxon) ?? []
  // First try taxon.id
  const tryGetNote = (id: number): string | undefined =>
    messages[id]?.[key]?.[locale] ??
    messages[id]?.[key]?.['en'] ??
    messages[id]?.['default']?.[locale] ??
    messages[id]?.['default']?.['en']

  let note = tryGetNote(taxon.id)
  if (note) return note

  // Then try ancestors (assumes sorted already)
  for (const ancestor of taxonAncestors) {
    note = tryGetNote(ancestor.id)
    if (note) return note
  }

  // Finally fall back to global default
  return (
    messages['default']?.['default']?.[locale] ?? messages['default']?.['default']?.['en'] ?? ''
  )
}
