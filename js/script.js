const STORAGE_KEY = "BookShelf-App";
const EVENT_RENDER = "render-book";
const bookList = [];

const showAlert = (icon, title, timer = 1000) => {
  Swal.fire({
    icon,
    title,
    showConfirmButton: false,
    timer,
  });
};

const isStorageAvailable = () => {
  if (typeof Storage === undefined) {
    showAlert("error", "Browser Anda tidak mendukung Web Storage!");
    return false;
  }
  return true;
};

const loadBooks = () => {
  const storedBooks = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (storedBooks) {
    bookList.push(...storedBooks);
  }
  document.dispatchEvent(new Event(EVENT_RENDER));
};

const saveBooks = (eventType, message) => {
  if (isStorageAvailable()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookList));
    document.dispatchEvent(new Event(eventType));
    showAlert("success", message);
  }
};

const createBookElement = (book) => {
  const bookContainer = document.createElement("div");
  bookContainer.classList.add("item");
  bookContainer.setAttribute("id", `book-${book.id}`);

  const titleElement = document.createElement("p");
  titleElement.classList.add("item-title");
  titleElement.innerHTML = `${book.title} <span>(${book.year})</span>`;

  const authorElement = document.createElement("p");
  authorElement.classList.add("item-writer");
  authorElement.innerText = book.author;

  const descContainer = document.createElement("div");
  descContainer.classList.add("item-desc");
  descContainer.append(titleElement, authorElement);

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("item-action");

  const createActionButton = (icon, className, clickHandler) => {
    const button = document.createElement("button");
    button.classList.add(className);
    button.innerHTML = `<i class='bx ${icon}'></i>`;
    button.addEventListener("click", clickHandler);
    return button;
  };

  if (book.isComplete) {
    actionContainer.append(
      createActionButton("bx-undo", "kembalikan-btn", () => toggleBookCompletion(book.id, false)),
      createActionButton("bx-trash", "hapus-btn", () => deleteBook(book.id))
    );
  } else {
    actionContainer.append(
      createActionButton("bx-check", "selesai-btn", () => toggleBookCompletion(book.id, true)),
      createActionButton("bx-trash", "hapus-btn", () => deleteBook(book.id))
    );
  }

  bookContainer.append(descContainer, actionContainer);
  return bookContainer;
};

document.addEventListener(EVENT_RENDER, () => {
  const unreadBookshelf = document.getElementById("unread");
  const readBookshelf = document.getElementById("alreadyRead");
  unreadBookshelf.innerHTML = "";
  readBookshelf.innerHTML = "";

  bookList.forEach((book) => {
    const bookElement = createBookElement(book);
    if (book.isComplete) {
      readBookshelf.append(bookElement);
    } else {
      unreadBookshelf.append(bookElement);
    }
  });
});

const addBook = () => {
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const year = Number(document.getElementById("year").value);
  const isComplete = document.getElementById("isRead").checked;

  const newBook = { id: +new Date(), title, author, year, isComplete };
  bookList.push(newBook);
  document.getElementById("formDataBuku").reset();
  document.dispatchEvent(new Event(EVENT_RENDER));
  saveBooks(EVENT_RENDER, "Data berhasil disimpan!");
};

const toggleBookCompletion = (bookId, isComplete) => {
  const book = bookList.find((b) => b.id === bookId);
  if (book) {
    book.isComplete = isComplete;
    document.dispatchEvent(new Event(EVENT_RENDER));
    saveBooks(EVENT_RENDER, "Data berhasil dipindahkan!");
  }
};

const deleteBook = (bookId) => {
  const bookIndex = bookList.findIndex((b) => b.id === bookId);
  if (bookIndex !== -1) {
    bookList.splice(bookIndex, 1);
    document.dispatchEvent(new Event(EVENT_RENDER));
    saveBooks(EVENT_RENDER, "Data berhasil dihapus!");
  }
};

const searchBook = () => {
  const searchValue = document.getElementById("search").value.toLowerCase();
  document.querySelectorAll(".item").forEach((item) => {
    const title = item.querySelector(".item-title").textContent.toLowerCase();
    item.classList.toggle("hidden", !title.includes(searchValue));
  });
};

document.addEventListener("DOMContentLoaded", () => {
  if (isStorageAvailable()) {
    loadBooks();
  }

  document.getElementById("formDataBuku").addEventListener("submit", (event) => {
    event.preventDefault();
    addBook();
  });

  document.getElementById("formSearch").addEventListener("submit", (event) => {
    event.preventDefault();
    searchBook();
  });

  document.querySelector(".reset-btn").addEventListener("click", () => {
    document.getElementById("search").value = "";
    searchBook();
  });
});
