let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {

    db = event.target.result;

    db.createObjectStore("pending", { keyPath: "id", autoIncrement: true })

};

request.onsuccess = function (event) {

    db = event.target.result;

    if(navigator.onLine) {

        checkDatabase();
    }
};

request.onerror = function (event) {
    
    console.log("Error" + event.target.errorCode);
};

function saveRecord(record) {
    console.log(db);

    const transaction = db.transaction(["pending"], "readwrite");
    const budgetStore = transaction.objectStore("pending");

    budgetStore.add(record);
}


function checkDatabase() {
    console.log(db);

    const transaction = db.transaction(["pending"], "readwrite");
    const budgetStore = transaction.objectStore("pending");
    const getAll = budgetStore.getAll();

    getAll.onsuccess = function () {

        if(getAll.result.length > 0) {

            fetch("/api/transaction/bulk", {

                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plan, */*",
                    "Content-Type": "application/json",
                }
            })

              .then((response) => response.json())

              .then(() => {

                const transaction = db.transaction(["pending"], "readwrite");
                const budgetStore = transaction.objectStore("pending");

                budgetStore.clear();

              })
        }
    }
}

window.addEventListener("online", checkDatabase);