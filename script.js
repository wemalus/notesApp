const searchWrapper = document.querySelector(".search-input");
const inputBox = searchWrapper.querySelector("input");

const addBox = document.querySelector(".add-box"),
    sortBoxTitle = document.querySelector(".sortTitle"),
    sortBoxDate = document.querySelector(".sortDate"),
    popupBox = document.querySelector(".popup-box"),
    popupTitle = popupBox.querySelector("header p"),
    closeIcon = popupBox.querySelector("header i"),
    titleTag = popupBox.querySelector("input"),
    descTag = popupBox.querySelector("textarea"),
    addBtn = popupBox.querySelector("button");
const months = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень",
    "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];
let notes = [];

// Retrieve notes data from server
function fetchNotes() {
    const response = fetch("https://localhost:7229/notes")
        .then(response => response.json())
        .then(data => {
            notes = data;
            showNotes();
        })
}
// Save note data to server
function saveNoteData(data) {
    const response = fetch("https://localhost:7229/notes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
        .then(data => {
            notes.push(data);
            showNotes();
        });
}

// Update note data on server
function updateNoteData(index, data) {
    let correctId = notes[index].id;

    data.id = correctId;
    fetch(`https://localhost:7229/notes/{id}?id=${correctId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            data.id = correctId;
            notes[index] = data;
            showNotes();
        })
        .catch(error => console.error(error));
}

// Delete note data from server
function deleteNoteData(id) {
    let correctId = notes[id].id;
    fetch(`https://localhost:7229/notes/{id}?id=${correctId}`, {
        method: 'DELETE'
    })
        .then(response => {
            notes.splice(id, 1);
            showNotes();
        })
        .catch(error => console.error(error));
}
let isUpdate = false, updateId;
addBox.addEventListener("click", () => {
    popupTitle.innerText = "Додати нову нотатку";
    addBtn.innerText = "Додати";
    popupBox.classList.add("show");
    document.querySelector("body").style.overflow = "hidden";
    if (window.innerWidth > 660) titleTag.focus();
});

var sortedDate = 0;
var sortedTitle = 0;
sortBoxDate.addEventListener("click", () => {
    inputBox.value = "";
    updateSearch("");
    if (sortedDate == 1) {
        sortedTitle = 0;
        sortedDate = 0;
    }
    else {
        sortedTitle = 0;
        sortedDate = 1;
        notes = notes.reverse();
    }
    showNotes(list);
});
sortBoxTitle.addEventListener("click", () => {
    inputBox.value = "";
    updateSearch("");
    notes = quickSort(notes, 0, notes.length - 1);
    if (sortedTitle == 1) {
        sortedTitle = 0;
        sortedDate = 0;
    }
    else {
        sortedTitle = 1;
        sortedDate = 0;
        notes = notes.reverse();
    }
    showNotes();
});
function swap(items, leftIndex, rightIndex) {
    var temp = items[leftIndex];
    items[leftIndex] = items[rightIndex];
    items[rightIndex] = temp;
}
function partition(items, left, right) {
    var pivot = items[Math.floor((right + left) / 2)],
        i = left,
        j = right;
    while (i <= j) {
        while (items[i].title < pivot.title) {
            i++;
        }
        while (items[j].title > pivot.title) {
            j--;
        }
        if (i <= j) {
            swap(items, i, j);
            i++;
            j--;
        }
    }
    return i;
}
function quickSort(items, left, right) {
    var index;
    if (items.length > 1) {
        index = partition(items, left, right);
        if (left < index - 1) {
            quickSort(items, left, index - 1);
        }
        if (index < right) {
            quickSort(items, index, right);
        }
    }
    return items;
}
closeIcon.addEventListener("click", () => {
    isUpdate = false;
    titleTag.value = descTag.value = "";
    popupBox.classList.remove("show");
    document.querySelector("body").style.overflow = "auto";
});
function showNotes() {

    document.querySelectorAll(".note").forEach(li => li.remove());
    notes.forEach((note, id) => {
        let filterDesc = note.description.replaceAll("\n", '<br/>');
        let currentDate = new Date(),
            month = months[currentDate.getMonth()],
            day = currentDate.getDate(),
            year = currentDate.getFullYear();
        let liTag = `<li class="note">
                        <div class="details">
                            <p>${note.title}</p>
                            <span>${filterDesc}</span>
                        </div>
                        <div class="bottom-content">
                            <span>${month} ${day}, ${year} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}</span>
                            <div class="settings">
                                <i onclick="showMenu(this)" class="uil uil-ellipsis-h"></i>
                                <ul class="menu">
                                    <li onclick="updateNote(${id}, '${note.title}', '${filterDesc}')"><i class="uil uil-pen"></i>Редагувати</li>
                                    <li onclick="deleteNote(${id})"><i class="uil uil-trash"></i>Видалити</li>
                                </ul>
                            </div>
                        </div>
                    </li>`;
        addBox.insertAdjacentHTML("afterend", liTag);
    });
}
function showMenu(elem) {
    elem.parentElement.classList.add("show");
    document.addEventListener("click", e => {
        if (e.target.tagName != "I" || e.target != elem) {
            elem.parentElement.classList.remove("show");
        }
    });
}
function deleteNote(noteId) {
    let confirmDel = confirm("Ви впевнені, що хочете видалити цю нотатку?");
    if (!confirmDel) return;
    deleteNoteData(noteId)
    showNotes();
}
function updateNote(noteId, title, filterDesc) {
    let description = filterDesc.replaceAll('<br/>', '\r\n');
    updateId = noteId;
    isUpdate = true;
    addBox.click();
    titleTag.value = title;
    descTag.value = description;
    popupTitle.innerText = "Оновити нотатку";
    addBtn.innerText = "Оновити";
}
addBtn.addEventListener("click", e => {
    e.preventDefault();
    let title = titleTag.value.trim(),
        description = descTag.value.trim();
    if (title || description) {
        let currentDate = new Date();
        let noteInfo = { title, description, date: currentDate }
        if (!isUpdate) {
            saveNoteData(noteInfo);
        } else {
            isUpdate = false;
            updateNoteData(updateId, noteInfo);
            noteInfo.id = notes[updateId].id;
            notes[updateId] = noteInfo;
        }
        closeIcon.click();
    }
});

inputBox.onkeyup = (e) => {
    updateSearch(e.target.value)
}
function updateSearch(e) {
    let userData = e;
    let emptyArray = [];
    if (userData) {
        emptyArray = notes.filter((data) => {

            return data.title.startsWith(userData) || data.description.startsWith(userData);
        });

        showNotes(emptyArray);

    } else {
        showNotes();
    }
}

function init() {
    fetchNotes();
}
init();
