monthlyExpenses = ["Rent", "Water", "Electric", "Gas"];

const totalByCat = (cat, month) => {
    let d;
    d = expenseData.filter(x => x.date.toDate().getMonth() === month && x.date.toDate().getFullYear() === curYear); //get this months stuff
    d = d.filter(x => x.cat === cat);
    d = d.reduce(((acc, curr) => acc+Number(curr.amt)), 0);
    return d;
}

const getSubTotal = (data, i) => {
    let sum = 0;
    for(let d of data) {
        firstOfMonth = new Date(`${i+1}/1/${curYear}`);
        if(i >= d.startDate.toDate().getMonth() && firstOfMonth <= d.endDate.toDate()) {
            sum += Number(d.amt);
        }
    }
    return sum;
}

const getMonthTotals = (i) => {
    let totals = [];

    for(let i = 0; i < overviewData.length; i++) {
        let utils = (Number(overviewData[i].water) + Number(overviewData[i].electric) + Number(overviewData[i].gas) + Number(overviewData[i].rent));
        let subs = getSubTotal(subscriptionsData, i);
        let cats = expenseData.filter(x => x.date.toDate().getMonth() === i && x.date.toDate().getFullYear() === curYear); //get this months/years stuff
        cats = cats.reduce(((acc, curr) => acc+Number(curr.amt)), 0);
        totals.push(cats+utils+subs)
    }
    return totals;
}

const renderCards = () => {
    let html = ``;
    for(let i = 0; i < overviewData.length; i++) {
        html+=`
        <div class="month-card ${curMonth === i ? "active-month" : ""}" onclick="editCard(${i})">
            <div class="card-header">
            <h1 class="card-title">${months[i]}</h1>
            </div>
            <hr><hr>
            ${monthlyExpenses.map(x => `<div class="monthly-total"><span>${x}</span><span>$${Number(overviewData[i][x.toLowerCase()]).toFixed(2)}</span></div><hr>`).join("")}
            <hr>
            <div class="monthly-total">
                <span style="color: ${catColors["utilities"]}">Utilities</span>
                <span>$${(Number(overviewData[i].water) + Number(overviewData[i].electric) + Number(overviewData[i].gas)).toFixed(2)}<span>
            </div>
            <hr>
            <div class="monthly-total">
                <span style="color: ${catColors["subscriptions"]}">Subscriptions</span>
                <span>$${(getSubTotal(subscriptionsData, i)).toFixed(2)}<span>
            </div>
            <hr>
            ${cats.map(x => `<div class="monthly-total">  <span style="color: ${catColors[x.toLowerCase()]}">${x}</span><span>$${totalByCat(x, i).toFixed(2)}</span></div><hr>`).join("")}
            <hr><hr>
            <div style="font-weight: bold" class="monthly-total"><span>Total</span><span>$${getMonthTotals()[i].toFixed(2)}</span></div>
        </div>
        `
    }
    let sum = getMonthTotals().reduce((a,b) => a+b);
    $(".upper-nav .totals").html(`Total: $${sum.toFixed(2)}`);
    $(".upper-nav .average").html(`Avg: $${(sum/(curMonth+1)).toFixed(2)}`);

    $("#monthly-cards").html(html);
}

const editCard = (idx) => {
    let d = overviewData[idx];
    swal.fire({
        title: months[idx],
        showCancelButton: true,
        confirmButtonText: 'Update',
        html: `
            ${monthlyExpenses.map(x => `<label for="modal-${x.toLowerCase()}">${x}</label><input id="modal-${x.toLowerCase()}" value=${d[x.toLowerCase()]}>`).join("")}
        `,
        preConfirm: function () {
            return new Promise(function (resolve) {
                resolve({
                water: Number($('#modal-water').val()),
                electric: Number($('#modal-electric').val()),
                gas: Number($('#modal-gas').val()),
                rent: Number($('#modal-rent').val()),
                })
            })
        },
    }).then(function (result) {
            if(result.isDismissed) { return; }

            if(result.isConfirmed) {
                let data = {...d, ...result.value};
                delete data.docId;
                overviewRef.doc(d.docId).update(data);
                overviewData[idx] = data;
                renderCards();
            }
    }).catch(swal.noop)
}

const addNextMonth = () => {
    let prevMonth = overviewData[overviewData.length - 1];
    overviewRef.add({
        rent: prevMonth.rent,
        water: 0,
        gas: 0,
        electric: 0,
        uid: curUser.uid,
        idx: (prevMonth.idx + 1) % 12,
        name: months[prevMonth.idx % 12]
    });
}