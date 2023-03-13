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
const notes = JSON.parse(localStorage.getItem("notes") || "[]");
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
        list = JSON.parse(localStorage.getItem("notes") || "[]");
    }
    else {
        sortedTitle = 0;
        sortedDate = 1;
        list = list = JSON.parse(localStorage.getItem("notes") || "[]").reverse();
    }
    showNotes(list);
});
sortBoxTitle.addEventListener("click", () => {
    inputBox.value = "";
    updateSearch("");
    list = JSON.parse(localStorage.getItem("notes") || "[]");;
    list = quickSort(list, 0, list.length - 1);
    if (sortedTitle == 1) {
        sortedTitle = 0;
        sortedDate = 0;
    }
    else {
        sortedTitle = 1;
        sortedDate = 0;
        list = list.reverse();
    }
    showNotes(list);
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
function showNotes(list) {
    if (!list) {
        if (!notes) return;
        list = notes;
    };
    document.querySelectorAll(".note").forEach(li => li.remove());
    list.forEach((note, id) => {
        let filterDesc = note.description.replaceAll("\n", '<br/>');
        let liTag = `<li class="note">
                        <div class="details">
                            <p>${note.title}</p>
                            <span>${filterDesc}</span>
                        </div>
                        <div class="bottom-content">
                            <span>${note.date} ${note.time}</span>
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
showNotes();
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
    notes.splice(noteId, 1);
    localStorage.setItem("notes", JSON.stringify(notes));
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
        let currentDate = new Date(),
            month = months[currentDate.getMonth()],
            day = currentDate.getDate(),
            year = currentDate.getFullYear();
        let noteInfo = { title, description, date: `${month} ${day}, ${year}`, time: `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}` }
        if (!isUpdate) {
            notes.push(noteInfo);
        } else {
            isUpdate = false;
            notes[updateId] = noteInfo;
        }
        localStorage.setItem("notes", JSON.stringify(notes));
        showNotes();
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


