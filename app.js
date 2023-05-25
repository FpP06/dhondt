document.addEventListener('DOMContentLoaded', init, false);

let dataTab;
let committees = ["PiS", "KO", "Lewica", "PSLiPL2050", "Konfederacja"];
let support_2019 = {PiS: 43.59, KO: 27.4, Lewica: 12.56, PSL: 8.55, Konfederacja: 6.81};
var myChart;
let colors = {
    PiS: "#073A76", 
    KO: "#E56701", 
    Lewica: "#A81245", 
    PSLiPL2050: "#91A724", 
    Konfederacja: "#0E213C",
    MN: '#0C0C0B'
};
let score = {};
let score_perc = {};
let input = document.getElementById('calculate');
let reset = document.getElementById('reset');
let inputAll = document.querySelectorAll('input');
let constituencies = document.querySelectorAll("path");
let constituencies_data;
let names = {};

async function init() {
    let response = await fetch('wyniki_po_okregach.json');
    dataTab = await response.json();
    dataTab = Object.values(dataTab);

}

input.addEventListener('click', function(event) {
    event.preventDefault();

    let current_support = {
        PiS: document.getElementById("PiS").value, 
        KO: document.getElementById("KO").value, 
        Lewica: document.getElementById("Lew").value, 
        PSLiPL2050: document.getElementById("PSLiPL2050").value,
        Konfederacja: document.getElementById("Konf").value
    };

    let sum = Object.values(current_support).reduce((total, supp) => total + Number(supp), 0);

    if(sum > 0 && sum <= 100) {
        let committee_votes = [];

        for(let x of dataTab) {
            let obj = {};
            obj["Numer"] = x.Numer;
            obj["Siedziba"] = x.Siedziba;
            obj["Wojewodztwo"] = x.Wojewodztwo;
            obj["Mandaty"] = x.Mandaty;
            obj["PiS"] = current_support.PiS >=8 ? Math.floor(((current_support.PiS/support_2019.PiS)*x.PiS)*x.Glosy/100) : 0;
            obj["KO"] = current_support.KO >=8 ? Math.floor(((current_support.KO/support_2019.KO)*x.KO)*x.Glosy/100) : 0;
            obj["Lewica"] = current_support.Lewica >=5 ? Math.floor(((current_support.Lewica/support_2019.Lewica)*x.Lewica)*x.Glosy/100) : 0;
            obj["PSLiPL2050"] = current_support.PSLiPL2050 >=8 ? Math.floor(((current_support.PSLiPL2050/support_2019.PSL)*x.PSL)*x.Glosy/100) : 0;
            obj["Konfederacja"] = current_support.Konfederacja >=5 ? Math.floor(((current_support.Konfederacja/support_2019.Konfederacja)*x.Konfederacja)*x.Glosy/100) : 0;
            names[x.Numer] = `Okręg wyborczy nr ${x.Numer} [${x.Siedziba}]:`;
            committee_votes.push(obj);
        }

        let constituency_results_arr = [];

        for(let x of committee_votes) {
            let obj = {};
            obj[x.Siedziba] = [];
            let mand = x.Siedziba === "Opole" ? 11 : x.Mandaty;
            for(let i = 1; i <= mand; i++) {
                obj[x.Siedziba].push({"Partia": "PiS", "Glosy": Math.floor(x.PiS/i)});
                obj[x.Siedziba].push({"Partia": "KO", "Glosy": Math.floor(x.KO/i)});
                obj[x.Siedziba].push({"Partia": "Lewica", "Glosy": Math.floor(x.Lewica/i)});
                obj[x.Siedziba].push({"Partia": "PSLiPL2050", "Glosy": Math.floor(x.PSLiPL2050/i)});
                obj[x.Siedziba].push({"Partia": "Konfederacja", "Glosy": Math.floor(x.Konfederacja/i)});
            }
            constituency_results_arr.push(obj);
        }
        let result = [];
        constituencies_data = [];
        for(let okr of dataTab) {
            let r = constituency_results_arr.map(x => Object.values(x))[okr.Numer-1][0].sort((a, b) => {
                return b.Glosy - a.Glosy;
            }).slice(0, okr.Mandaty).map(x => Object.values(x)[0]);
            if(okr.Siedziba !== "Opole") {
                let o = {
                    PiS: r.filter(x => x === "PiS").length, 
                    KO: r.filter(x => x === "KO").length, 
                    Lewica: r.filter(x => x === "Lewica").length, 
                    PSLiPL2050: r.filter(x => x === "PSLiPL2050").length, 
                    Konfederacja: r.filter(x => x === "Konfederacja").length
                };
                o = Object.entries(o).sort((a, b) => {
                    return b[1] - a[1];
                });
                if(constituencies_data.length < 41) constituencies_data.push(o);
                document.querySelector(`[data-id="${okr.Numer}"]`).style.fill = o[0][1] !== o[1][1] ? `${colors[o[0][0]]}` : "gray";
            }
            else {
                let o = {
                    PiS: r.filter(x => x === "PiS").length, 
                    KO: r.filter(x => x === "KO").length, 
                    Lewica: r.filter(x => x === "Lewica").length, 
                    PSLiPL2050: r.filter(x => x === "PSLiPL2050").length, 
                    Konfederacja: r.filter(x => x === "Konfederacja").length,
                    MN: 1
                };
                o = Object.entries(o).sort((a, b) => {
                    return b[1] - a[1];
                });
                if(constituencies_data.length < 41) constituencies_data.push(o);
                document.querySelector(`[data-id="${okr.Numer}"]`).style.fill = o[0][1] !== o[1][1] ? `${colors[o[0][0]]}` : "gray";
            }
            r.forEach(x => {
                result.push(x);
            });
        }
        //constituencies_data[20].push(["MN", 1]);
        score_perc = {
            PiS: ((result.filter(c => c === "PiS").length)/4.6).toFixed(2),
            KO: ((result.filter(c => c === "KO").length)/4.6).toFixed(2),
            Lewica: ((result.filter(c => c === "Lewica").length)/4.6).toFixed(2),
            PSLiPL2050:((result.filter(c => c === "PSLiPL2050").length)/4.6).toFixed(2),
            Konfederacja: ((result.filter(c => c === "Konfederacja").length)/4.6).toFixed(2)
        }; 
        score = {
            PiS: result.filter(c => c === "PiS").length,
            KO: result.filter(c => c === "KO").length,
            Lewica: result.filter(c => c === "Lewica").length,
            PSLiPL2050: result.filter(c => c === "PSLiPL2050").length,
            Konfederacja: result.filter(c => c === "Konfederacja").length
        }; 
    
        createChart()
                
        for(let x of committees) {
            document.querySelector(`.${x}`).textContent = score[x];
            document.querySelector(`.${x}_perc`).textContent = score_perc[x];
        }
        document.querySelector('.MN').textContent = 1;
        document.querySelector('.MN_perc').textContent = (100/460).toFixed(2);
        document.querySelector('.result').style.height = "900px";
        document.querySelector('.map').style.display = "block";
    }
});

reset.addEventListener('click', function(event) {
    event.preventDefault();
    document.querySelector('.map').style.display = "none";
    document.querySelector('.result').style.height = "0px";
    for(let x of committees) {
        document.querySelector(`.${x}`).textContent = "";
    }
    document.querySelector(".MN").textContent = "";
    for(let x of committees) {
        document.querySelector(`.${x}_perc`).textContent = "";
    }
    document.querySelector(".MN_perc").textContent = "";
    if(myChart) {
        myChart.destroy();
    }
    
    inputAll.forEach((element) => {
        element.value = 0;
    });
});

function createChart() {
    if(myChart) {
        myChart.destroy();
    }
    var ctx = document.getElementById("myChart");
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ["Lewica", "KO", "PSL i PL2050", "Mniejszość Niemiecka", "Konfederacja", "PiS"],
            datasets: [{
                label: 'Mandaty: ',
                data: [score.Lewica, score.KO, score.PSLiPL2050, 1, score.Konfederacja, score.PiS],
                backgroundColor: [
                    colors.Lewica, 
                    colors.KO, 
                    colors.PSLiPL2050,
                    colors.MN, 
                    colors.Konfederacja, 
                    colors.PiS
                ],
                borderWidth: 2,
                hoverBorderWidth: 4,
                borderColor: 'white',
                hoverBorderColor: '#726666'
            }]
        },
        options: {
            circumference: 180,
            rotation: -90,
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    align: 'center',
                    labels: {
                       color: 'black',
                       font: {
                          weight: 'bold'
                       },
                    }
                 }
            }
        }
    });
}

window.addEventListener('beforeprint', () => {
    myChart.options;
  });

constituencies.forEach(e => {
    e.addEventListener("mouseover", createTooltip)
});
constituencies.forEach(e => {
    e.addEventListener("mouseleave", removeTooltip)
});

function createTooltip(event) {
    let tooltip = document.getElementById("tooltip");
    console.log(constituencies_data[event.target.dataset.id-1][0]);
    let data = `<div class="el"><span>${names[event.target.dataset.id]}</span>`;
    for(let i = 0; i < constituencies_data[event.target.dataset.id-1].length; i++) {
        let name = constituencies_data[event.target.dataset.id-1][i][0] === "PSLiPL2050" ? "PSL i PL2050" : constituencies_data[event.target.dataset.id-1][i][0];
        data += `<div><div class="square" style="background-color:${colors[constituencies_data[event.target.dataset.id-1][i][0]]}"></div>${name} - ${constituencies_data[event.target.dataset.id-1][i][1]}</div>`
    }
    data += `</div>`;
    tooltip.innerHTML = data;
    tooltip.style.display = "flex";
    tooltip.style.left = event.pageX + 20 + 'px';
    tooltip.style.top = event.pageY + 20 + 'px';
  }
  
  function removeTooltip() {
    var tooltip = document.getElementById("tooltip");
    tooltip.style.display = "none";
  }