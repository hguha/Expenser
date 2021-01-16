
//SERVICE WORKERS
window.onload = () => {  
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
               .register('./sw.js');
    }
}

//ROUTING
let defaultRoute = "expenses";
let curRoute = "";
var chart;

const navigate = (route) => {
    if(curRoute == route) return;
    curRoute = route;
    $.get(`/templates/${route}.html`, (data) => {
        $("#app-content").html(data);
        


    });
}
navigate(defaultRoute);


$(`#menu button#${defaultRoute}`).addClass("active-tab");
$("#menu button").click(function() {
    $("#menu button").removeClass("active-tab");
    $(this).addClass("active-tab");
});

//AUTHENTICATION
const auth = firebase.auth();
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');

const provider = new firebase.auth.GoogleAuthProvider();
signInBtn.onclick = () => auth.signInWithPopup(provider);
signOutBtn.onclick = () => confirm("Are you sure you want to sign out?") ? auth.signOut() : null;

auth.onAuthStateChanged(user => {
    if (user) {
        $("#sign-in").hide();
        $("#content").show();
    } else {
        $("#sign-in").show();
        $("#content").hide();
    }
});

//DATABASE
let expenseData;
let overviewData;
let curUser;
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatDate = (d) => {
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

let catColors = {
    utilities: "#0049FF",
    groceries: "#2E6AFF",
    amazon: "#55A2FF",
    feasting: "#55C4FF",
    misc: "#55E5FF"
};

let curMonth = (new Date()).getMonth();
let curYear = (new Date()).getFullYear();


const renderList = (data) => {
    let html = ``;
    showData = inFilter(data);

    //totals
    let total = showData.reduce(((acc, curr) => acc+Number(curr.amt)), 0);
    $(".upper-nav .totals").html(`Total: $${total.toFixed(2)}`);

    if(!showData || !showData.length) {
        $("#expense-list").html("No data in selected range");
        return;
    }

    for([i,d] of data.entries()) {
        if(showData.indexOf(d) == -1) continue;
        
        html+=` <div onclick="addOrEditItemModal(${i})" id="row-${i}" class="expense-row">
                    <div class="details">
                    <span class="title">${d.title}</span>
                    <span class="amt">$${Number(d.amt).toFixed(2)}</span>
                    </div>
                    <div class="details">
                    <span class="date">${formatDate(d.date.toDate())}</span>
                    <span style="color: ${catColors[d.cat.toLowerCase()]}" class="cat">${d.cat}</span>
                    
                    </div>
                </div>`;
    }
    
    $("#expense-list").html(html);
}


const db = firebase.firestore();
let expensesRef;
let overviewRef;
let unsubscribe;
let unsubscribe2;

auth.onAuthStateChanged(user => {
    curUser = user; 
    if (user) { 
        expensesRef = db.collection('expenses');
        overviewRef = db.collection('overview');

        // GET EXPENSE LIST
        unsubscribe = expensesRef
        .where('uid', '==', user.uid)
        .orderBy('date', 'desc')
        .onSnapshot(query => {
            let data = query.docs.map(doc => {
                let d = doc.data()
                d["docId"] = doc.id;
                return d;
            });
            expenseData = data;
            renderList(data);
        });  
        
        unsubscribe2 = overviewRef
        .where('uid', '==', user.uid)
        .orderBy('idx')
        .onSnapshot(query => {
            let data = query.docs.map(doc => {
                let d = doc.data()
                d["docId"] = doc.id;
                return d;
            });
            overviewData = data.filter(x => x.year == (new Date()).getFullYear());
            if(!overviewData.length) { createYearsOverviewData(); } //this line should trigger once a year lol
        });   
    } 
    else { unsubscribe && unsubscribe(); }
});

const createYearsOverviewData = () => {
    for(let i = 0; i < 12; i++) {
        data = {
            rent: 0,
            water: 0,
            electric: 0,
            gas: 0,
            name: months[i],
            idx: i+1,
            year: (new Date()).getFullYear(),
            uid: curUser.uid
        }
        overviewRef.add(data);
    }
}