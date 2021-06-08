const formatDateForInput = (d) => {
    const year = d.getFullYear();
    const month = (d.getMonth() < 10 ? "0" : "") + String(d.getMonth()+1);
    const day = (d.getDate() < 10 ? "0" : "") + String(d.getDate());
    return `${year}-${month}-${day}`;
}

const nextDay = (date) => {
    return new Date(date.setDate(date.getDate() + 1));
}

let empty = {title:"", cat:"", amt: "", date: formatDateForInput(new Date()), notes: ""};
let cats = ["Groceries", "Amazon", "Feasting", "Misc", "Gifts"];

const addOrEditItemModal = (idx) => {
    const editing = idx > -1;
    const d = editing ? expenseData[idx] : empty;
    swal.fire({
        title: editing ? "Edit Item" : "Add Item",
        showCancelButton: true,
        showDenyButton: editing,
        confirmButtonText: editing ? "Update" : "Add",
        denyButtonText: 'Delete',
        html: `
        <label for="modal-title">Title</label>
        <input id="modal-title" value="${d.title}">

        <label for="modal-date">Date</label>
        <input id="modal-date" type="date" value="${editing ? formatDateForInput(d.date.toDate()) : empty.date}">
        
        <label for="modal-cat">Category</label>
        <select id="modal-cat">
            <option disabled ${!d.cat ? "selected" : ""} value>    </option>
            ${cats.map(x => `<option value="${x}" ${d.cat === x ? "selected" : ""} >${x}</option>`).join("")}
        </select>
        <label for="modal-amt">Amount</label>
        <input id="modal-amt" type="number" value="${d.amt}">
        
        <label for="modal-notes">Notes</label>
        <textarea rows=4 id="modal-notes">${d.notes}</textarea>
        `,
        preConfirm: function () {
            return new Promise(function (resolve) {
                resolve({
                title: $('#modal-title').val(),
                date: $('#modal-date').val(),
                cat: $('#modal-cat').val() || "Misc",
                amt: $('#modal-amt').val(),
                notes: $('#modal-notes').val(),
                })
            })
        },

    }).then(function (result) { //the part that handles the recieved input
            if(result.isDismissed) { return; }
            
            if(result.isDenied) { 
                if(curUser) {
                    expensesRef.doc(d.docId).delete();
                }
            }

            if(result.isConfirmed) {
                result.value["date"] = nextDay(new Date(result.value["date"]));
                result.value["uid"] = curUser.uid;
                result.value["createdAt"] = new Date();
                if(editing) { expensesRef.doc(d.docId).set(result.value); }
                else { expensesRef.add(result.value);}
            }
    }).catch(swal.noop)
}
let fromfilter = formatDateForInput(new Date(`${(new Date()).getMonth()+1}/1/${curYear}`));
let tofilter = formatDateForInput(new Date(`${(new Date()).getMonth()+1}/31/${curYear}`));
let catfilter = "";
let keyfilter = "";

const createFiltersModal = () => {
    swal.fire({
        title: 'Filter',
        showCancelButton: true,
        confirmButtonText: 'Filter',
        html: `
        <label for="start-range">From</label>
        <input id="start-range" type="date" value="${fromfilter}">
        
        <label for="end-range">To</label>
        <input id="end-range" type="date" value="${tofilter}">
        
        <label for="cat-filter">Category</label>
        <input  id="cat-filter" list="cats" value="${catfilter}">
        <datalist id="cats"> ${cats.map(x => `<option value="${x}">`).join("")} </datalist>

        <label for="key-filter">Keyword</label>
        <input  id="key-filter" value="${keyfilter}">
        `,
        preConfirm: function () {
            return new Promise(function (resolve) {
                resolve({
                fromfilter: $('#start-range').val(),
                tofilter: $('#end-range').val(),
                catfilter: $('#cat-filter').val(),
                keyfilter: $('#key-filter').val(),
                })
            })
        },
    }).then(function (result) { //the part that handles the recieved input
            if(result.isDismissed) { return; }
            if(result.isConfirmed) {
                fromfilter = result.value.fromfilter;
                tofilter = result.value.tofilter;
                catfilter = result.value.catfilter;
                keyfilter = result.value.keyfilter;
                renderList(expenseData);
            }
    }).catch(swal.noop)
}

const inFilter = (data) => {
    if(!data) return [];
    //date
    data = data.filter(x => (new Date(x.date.toDate()) >= nextDay(new Date(fromfilter))) && (new Date(x.date.toDate()) <= nextDay(new Date(tofilter))));

    //category
    data = catfilter ? data.filter(x => x.cat == catfilter) : data;

    //keyword
    data = keyfilter ? data.filter(x => x.title.toLowerCase().search(keyfilter.toLowerCase()) > -1) : data;
    return data;
}