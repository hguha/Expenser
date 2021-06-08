let emptySub = {name:"", amt: "", endDate: formatDateForInput(new Date()), startDate: formatDateForInput(new Date())};

const renderSubList = (data) => {
    let html = ``;
    showData = data;

    //totals
    let total = showData.reduce(((acc, curr) => acc+Number(curr.amt)), 0);
    $(".upper-nav .totals").html(`Total: $${total.toFixed(2)}`);

    if(!showData || !showData.length) {
        $("#expense-list").html("No data in selected range");
        return;
    }

    for([i,d] of data.entries()) {
        if(showData.indexOf(d) == -1) continue;
    
        html+=` <div onclick="addOrEditSubscription(${i})" id="row-${i}" class="expense-row">
                    <div class="details">
                    <span class="title">${d.name}</span>
                    <span class="amt">$${Number(d.amt).toFixed(2)}</span>
                    </div>
                    <div class="details">
                    <span class="date">${formatDate(d.startDate.toDate())}</span>        
                    <span style="color: gray" class="cat">$${(d.amt*12).toFixed(2)}</span>            
                    </div>
                </div>`;
    }
    
    $("#expense-list").html(html);
}

const addOrEditSubscription = (idx) => {
    const editing = idx > -1;
    const d = editing ? subscriptionsData[idx] : emptySub;
    swal.fire({
        title: editing ? "Edit Item" : "Add Item",
        showCancelButton: true,
        showDenyButton: editing,
        confirmButtonText: editing ? "Update" : "Add",
        denyButtonText: 'Delete',
        html: `
        <label for="modal-title">Title</label>
        <input id="modal-title" value="${d.name}">

        <label for="modal-date">Start Date</label>
        <input id="modal-startdate" type="date" value="${editing ? formatDateForInput(d.startDate.toDate()) : empty.date}">

        <label for="modal-date">End Date</label>
        <input id="modal-enddate" type="date" value="${editing ? formatDateForInput(d.endDate.toDate()) : empty.date}">
        
        <label for="modal-amt">Amount</label>
        <input id="modal-amt" type="number" value="${d.amt}">
        `,
        preConfirm: function () {
            return new Promise(function (resolve) {
                resolve({
                name: $('#modal-title').val(),
                startDate: $('#modal-startdate').val(),
                endDate: $('#modal-enddate').val(),
                amt: $('#modal-amt').val(),
                })
            })
        },

    }).then(function (result) { //the part that handles the recieved input
            if(result.isDismissed) { return; }
            
            if(result.isDenied) { 
                if(curUser) {
                    subscriptionsRef.doc(d.docId).delete();
                }
            }

            if(result.isConfirmed) {
                result.value["endDate"] = nextDay(new Date(result.value["endDate"]));
                result.value["startDate"] = nextDay(new Date(result.value["startDate"]));
                result.value["uid"] = curUser.uid;
                if(editing) { subscriptionsRef.doc(d.docId).set(result.value); }
                else { subscriptionsRef.add(result.value);}
            }
    }).catch(swal.noop)
}