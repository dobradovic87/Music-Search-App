/** Za pokretanje aplikacije neophodan je server sa adresom localhost 8000
 * ova adresa se je stavljena kao primarna za korišćenje aplikacije jer je to traženo od strane Google-a
 * do sada je korišćen python server čija pokretanje u terminalu vam dajem u sledećem redu
 * python -m SimpleHTTPServer 8000
 */
var ajaxUrl = 'https://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=';
var albumUrl = 'http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=8960814a99312e10f3209b628cd9784d';
var tracksAjaxUrl = 'http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=';
var api_key = '8960814a99312e10f3209b628cd9784d';
var container = document.getElementById('flex-container');
var div = document.getElementById('cover');
var h3 = document.getElementById('nema-tog-naslova');
var divRes;
var img;
var name;
var posterDiv;
var arrID = [];
var divOnclick;
var search = document.getElementById(search);
var divLoader;
var searchName = document.getElementById('cover');
var youtubeDiv = document.querySelector(".youtube");
youtubeDiv.style.display = "none";
var result;
var footer = document.querySelector('#footer');
footer.style.visibility = "hidden";
var divSelect = document.getElementById("divSelect");
var currentPage = document.getElementById("currentPage");
var selectPage = document.getElementById("selectPage");


//--------------------------------------------------
//*** Pokretanje aplikacije za traženje omota albuma
//--------------------------------------------------
document.getElementById('search').addEventListener('keypress', coversApiCall);

//*** API Call za omote albuma pritiskom na ENTER u polju za pretragu
function coversApiCall(event) {
    var search = document.getElementById("search").value;
    if (event.key === 'Enter') {
        window.location = '#';
        youtubeDiv.innerHTML = "";
        youtubeDiv.style.display = "none";
        document.querySelector('#main').style.display = 'block';
        document.querySelector('#footer').style.display = 'block';
        document.querySelector("#header").className = "col"
        // Setovanje vidljivosti i sadržaja pojedinih elemenata
        currentPage.style.display = "none";
        divSelect.style.display = "none";
        selectPage.innerText = "";
        searchName.innerText = "";
        openModal();
        document.body.style.overflow = "hidden";
        var xr = new XMLHttpRequest();
        xr.addEventListener('load', renderCovers);
        var ajaxUrlResolved = ajaxUrl + search + '&api_key=' + api_key + '&format=json';
        xr.open('GET', ajaxUrlResolved, true);
        xr.send();
    }

}

function openModal() {
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Iscrtavanje omota albuma iz dobijenih podataka(objekta)
function renderCovers() {
    if (document.getElementById('divRes') !== null) {
        resetHtml();
    }
    var obj = JSON.parse(this.responseText);
    console.log(obj);
    footer.style.visibility = "visible";
    divRes = document.createElement('div');
    divRes.setAttribute('id', 'divRes');
    divRes.setAttribute('class', 'result');
    container.appendChild(divRes);
    var option;
    // ako objekat sadrži properti topalbums onda mogu da se iscrtaju omoti
    if (obj.hasOwnProperty('topalbums')) {
        searchName.innerText = 'Album covers of: ' + obj.topalbums["@attr"].artist;
        for (var i = 0; i < obj.topalbums.album.length; i++) {
            //kreiranje slike i onclick event-a
            posterDiv = document.createElement('div');
            img = document.createElement('img');
            posterDiv.setAttribute('class', 'poster');
            posterDiv.setAttribute('id', 'image' + '-' + i);
            img.title = obj.topalbums.album[i].name;
            img.id = 'img' + i;
            img.addEventListener('click', albumsInfoApi);
            var posterName = document.createElement('h4');
            if (obj.topalbums.album[i].name === "(null)" || obj.topalbums.album[i].name === "null" || obj.topalbums.album[i].name === "undefined") {
                posterName.innerText = "*Album title is not available";
            }
            else {
                posterName.innerText = obj.topalbums.album[i].name;
            }
            divOnclick = document.createElement('div');
            divOnclick.setAttribute('class', 'sidebar');
            divOnclick.setAttribute('id', 'div-' + 'image-' + i);
            posterDiv.append(img, posterName);
            divLoader = document.createElement('div');
            divLoader.setAttribute('id', 'loader' + i);
            divLoader.setAttribute('class', 'loading');
            loaderImage = document.createElement('img');
            loaderImage.src = "./images/loading.gif";
            divLoader.appendChild(loaderImage);
            arrID.push(img.id, posterDiv.id, divOnclick.id, divLoader.id);
            divRes.appendChild(posterDiv);
            divRes.appendChild(divOnclick);
            divRes.appendChild(divLoader);
            divOnclick.style.display = "none";

            // posle kreiranja elementa img treba ubaciti sliku koja se nalazi u nizu image
            // u image nizu na 3. poziciji je slika veličine 300 x 300 koja je potrebna
            if ((obj.topalbums.album[i].image[3]["#text"] != "") && (obj.topalbums.album[i].image[3].size = "extralarge")) {
                //setuj src atribut slike na trenutni poster
                img.setAttribute('src', obj.topalbums.album[i].image[3]["#text"] + ":./images/no-image-found.jpg");
            }
            // U slučaju da nema slike u objektu setujemo na lokalnu sliku no-image-found.jpg
            else {
                img.setAttribute('src', './images/no-image-found.jpg');
            }
        }
        // Punjenje option-a sa vrednostima o broju strana
        // * Broj strana je sveden na 100 ili manje zbog toga što preko 100. strane nema slika za omote albuma p
        if (obj.topalbums["@attr"].totalPages > 100) {
            for (l = 1; l <= 100; l++) {
                option = document.createElement("option");
                option.value = l;
                option.textContent = l;
                selectPage.appendChild(option);
            }
        }
        else {
            for (k = 1; k <= obj.topalbums["@attr"].totalPages; k++) {
                option = document.createElement("option")
                option.value = k;
                option.textContent = k;
                selectPage.appendChild(option);
            }
        }
        // Informacije koje se ispisuju u footer-u
        currentPage.textContent = "The current page: " + obj.topalbums["@attr"].page;
        currentPage.style.display = "inline";
        divSelect.style.display = "inline";
        closeModal();
        document.body.style.overflow = "auto";
    }

    else {
        // pozvati funkciju koja setuje HTML za situaciju kada nema pogodaka (unesen je neki pogresan string)
        setNoResults(document.getElementById('search').value);
        closeModal();
    }
}


//Funkcija koja se poziva u slučaju da nema rezultata za unetu pretragu
function setNoResults(searchQ) {
    console.log(searchQ);
    console.log(h3);
    document.getElementById('divRes').style.display = 'none';
    footer.style.visibility = "hidden";
    h3.style.visibility = 'visible';
    h3.innerHTML = `No matches for: <strong> ${searchQ} </strong>`;
}

// Resetovanje dinamički kreiranog elementa div i uklanjanje sadržaja
function resetHtml() {
    divRes.parentNode.removeChild(divRes);
    h3.textContent = '';
    h3.style.visibility = 'hidden';
}


// funkcija za dodavanje stranica koja uzima vrednost iz option-a referencira novi API call za tu stranu
selectPage.addEventListener('change', pageNumber);
function pageNumber() {
    footer.style.visibility = "hidden";
    var num = selectPage.value;
    console.log(num);
    window.location = '#';
    youtubeDiv.style.display = "none";
    openModal();
    document.body.style.overflow = "hidden";
    var xr = new XMLHttpRequest();
    xr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            xr.addEventListener('load', renderNewPage);
        }
        else {
            h3.style.visibility = 'visible';
            h3.innerHTML = `Error ocurred while loading the page ${num}.</br>Please reload the page ${num} again or load some other page`;
        }
    };
    var ajaxUrlResolved1 = ajaxUrl + document.getElementById('search').value + '&api_key=' + api_key + '&format=json' + '&page=' + num;
    xr.open('GET', ajaxUrlResolved1, true);
    xr.send();
}

// Iscrtavanje omota albuma za traženu stranu
// Veoma slično kao i renderCovers funkcija
function renderNewPage() {
    if (document.getElementById('divRes') !== null) {
        resetHtml();
    }
    var pagesObj = JSON.parse(this.responseText);
    console.log(pagesObj);
    divRes = document.createElement('div');
    divRes.setAttribute('id', 'divRes');
    divRes.setAttribute('class', 'result');
    container.appendChild(divRes);

    if (pagesObj.hasOwnProperty('topalbums')) {
        for (var i = 0; i < pagesObj.topalbums.album.length; i++) {
            posterDiv = document.createElement('div');
            img = document.createElement('img');
            img.id = 'img' + i;
            posterDiv.setAttribute('class', 'poster');
            posterDiv.setAttribute('id', 'image' + '-' + i);
            img.title = pagesObj.topalbums.album[i].name;
            img.addEventListener('click', albumsInfoApi);
            var posterName = document.createElement('h4');
            if (pagesObj.topalbums.album[i].name === "(null)" || pagesObj.topalbums.album[i].name === "null" || pagesObj.topalbums.album[i].name === "undefined") {
                posterName.innerText = "*Album title is not available";
            }
            else {
                posterName.innerText = pagesObj.topalbums.album[i].name;
            }
            divOnclick = document.createElement('div');
            divOnclick.setAttribute('class', 'sidebar');
            divOnclick.setAttribute('id', 'div-' + 'image-' + i);
            posterDiv.append(img, posterName);
            divLoader = document.createElement('div');
            divLoader.setAttribute('id', 'loader' + i);
            divLoader.setAttribute('class', 'loading');
            loaderImage = document.createElement('img');
            loaderImage.src = "./images/loading.gif";
            divLoader.appendChild(loaderImage);
            arrID.push(img.id, posterDiv.id, divOnclick.id, divLoader.id);
            divRes.appendChild(posterDiv);
            divRes.appendChild(divOnclick);
            divRes.appendChild(divLoader);
            divOnclick.style.display = "none";

            if ((pagesObj.topalbums.album[i].image[3]["#text"] !== "") && (pagesObj.topalbums.album[i].image[3].size = "extralarge")) {
                img.setAttribute('src', pagesObj.topalbums.album[i].image[3]["#text"] + ":./images/no-image-found.jpg");
            }
            else {
                img.setAttribute('src', './images/no-image-found.jpg');
            }
        }
    }
    currentPage.textContent = "The current page: " + pagesObj.topalbums["@attr"].page;
    closeModal();
    document.body.style.overflow = "auto";
    footer.style.visibility = "visible";
}

//------------------------------------------------------------
//*** API Call za informacije o albumima i njihovo iscrtavanje
//------------------------------------------------------------

function albumsInfoApi(e) {
    clicked = document.getElementById(e.target.id);
    imgID = e.target.id;
    var index = arrID.indexOf(imgID);
    document.getElementById(arrID[index + 1]).style.display = "none";
    document.getElementById(arrID[index + 3]).style.display = "block";
    document.getElementById(arrID[index + 2]).innerHTML = '';
    var xr = new XMLHttpRequest();
    xr.addEventListener('load', sidebarResponse);
    var ajaxUrlResolved3 = `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${api_key}&artist=${document.getElementById('search').value}&album=${clicked.title}&format=json`;
    xr.open('GET', ajaxUrlResolved3, true);
    xr.send();

}

// Parsiranje dobijenog JSON odgovora u objekat sa kojim će se manipulisati
function sidebarResponse() {
    var objSidebar = JSON.parse(this.responseText);
    console.log(objSidebar);
    renderSidebar(objSidebar);
}

//Iscrtavanje sidebar-a iz dobijenog objekta za traženi album
//zbog preglednosti je posebna funkcija a mogla je biti i u okviru sidebarResponse funkcije
function renderSidebar(objSidebar) {
    var index = arrID.indexOf(imgID);
    var btnClose = document.createElement('button');
    btnClose.addEventListener('click', closeSidebar);
    btnClose.setAttribute('class', 'close');
    btnClose.innerText = '×';

    if (objSidebar.hasOwnProperty('album')) {
        var albumName = document.createElement('h2');
        if (objSidebar.album.name === "(null)" || objSidebar.album.name === "null" || objSidebar.album.name === "undefined") {
            albumName.innerText = "*Album title is not available";
        }
        else {
            albumName.innerText = `Album: ${objSidebar.album.name}`;
        }
        var tracks = document.createElement('h3');
        tracks.innerText = `Tracks:`;
        if (objSidebar.album.tracks.track.length > 0) {
            var olList = document.createElement('ol');
            var list;
            list = `
         ${objSidebar.album.tracks.track.map((item) => `
         <li id="${item.name}" onclick="youtubeSearch(event)">${item.name}</li>`).join('')}
         `;
            olList.innerHTML = list;
        }
        else {
            var olList = document.createElement('p');
            olList.innerHTML = `There is no information about album tracks`;
        }
        document.getElementById(arrID[index + 2]).append(btnClose, albumName, tracks, olList);

    }
    else {
        var message = document.createElement('h4')
        message.innerHTML = `Album not found`;
        document.getElementById(arrID[index + 2]).append(btnClose, message);
    }

    document.getElementById(arrID[index + 3]).style.display = "none";
    document.getElementById(arrID[index + 2]).style.display = "block";

}

// Funkcija za zatvaranje sidebar-a
function closeSidebar(event) {
    var parentID = event.target.parentNode.id;
    var index = arrID.indexOf(parentID);
    console.log(event.target.parentNode.id);
    document.getElementById(arrID[index]).style.display = "none";
    document.getElementById(arrID[index - 1]).style.display = "block";

}
//---------------------------------------------------
//*** YouTube API Call
//---------------------------------------------------
// Automatsko pozivanje predefinisane funkcije prilikom učitavanja JavaScript-a
// Stavlja su u script tag u HTML-u i pokreće sve u vezi YouTube API-ja
function onClientLoad() {
    gapi.client.load('youtube', 'v3', onYouTubeApiLoad);
}

// Predefinisana funkcija koja setuje API ključ kada je API učitan
function onYouTubeApiLoad() {
    gapi.client.setApiKey('AIzaSyArexS5lO3warzDVw7FuMMIfTEHEImj4LU');
}

// Poziva se funkcija kada je u sidebar-u kliknuto na neku pesmu
// Pomoću event target-a se odredjuje id pesme i šalje zahtev ka API-ju
function youtubeSearch(event) {
    var clicked = document.getElementById(event.target.id);
    openModal();
    document.body.style.overflow = "hidden";
    document.querySelector('#main').style.display = 'none';
    document.querySelector('#footer').style.display = 'none';
    // Brisanje prethodnog rezultata 
    document.querySelector('.youtube').innerHTML = '';
    // Request za  search.list() API call sa neophodnim parametrima
    var search = document.getElementById("search").value;
    var q = `${search} - ${clicked.innerText}`;
    var request = gapi.client.youtube.search.list({
        part: 'snippet, id',
        q: q,
        type: 'video',
        videoEmbeddable: true,
        // videoSyndicated: true,
        maxResults: 1
    });
    // Slanje request-a ka  API serveru i pozivanje onSearchResponse funkcije kada su podaci vraćeni
    request.execute(onSearchResponse);
}

// Funkcija za manipulisanje sa vraćenim podacima tj. objektom
function onSearchResponse(data) {
    console.log(data);
    youtubeDiv.style.display = "flex";
    var newYouTubeDiv = document.createElement('div');
    newYouTubeDiv.setAttribute('class', 'newyoutube');

    if (data.hasOwnProperty('error')) {
        output = `
            <button onclick="closeVideo()" class="closeYT">×</button>
            <h3>Video can't be loaded because Daily Limit Exceeded<br> or there is some other issue with YouTube API</h3>
            `;
    }
    else {
        var videoId = data.items[0].id.videoId;
        // Iscrtavanje youtube plejera u youtube div-u
        output = `
            <button onclick="closeVideo()" class="closeYT">×</button>
            <iframe width="640" height="360" src="//www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
            `;
    }
    newYouTubeDiv.innerHTML = output;
    document.querySelector('.youtube').appendChild(newYouTubeDiv)
    closeModal();
    document.body.style.overflow = "auto";
}

// Funkcija za zatvaranje YouTube div-a odnosno plejera
function closeVideo() {
    youtubeDiv.innerHTML = "";
    youtubeDiv.style.display = "none";
    document.querySelector('#main').style.display = 'block';
    document.querySelector('#footer').style.display = 'block';
}