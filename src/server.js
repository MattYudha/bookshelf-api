const http = require("http");
const { nanoid } = require("nanoid");
const fs = require("fs");

// Fungsi untuk membaca data dari file
const loadBooks = () => {
  try {
    const data = fs.readFileSync("books.json", "utf8");
    const booksData = JSON.parse(data);
    if (booksData.length === 0) {
      const defaultBook = {
        id: "1",
        name: "Sample Book",
        year: 2023,
        author: "Sample Author",
        summary: "A sample book summary.",
        publisher: "Sample Publisher",
        pageCount: 200,
        readPage: 0,
        finished: false,
        reading: false,
        insertedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      booksData.push(defaultBook);
      saveBooks(booksData);
    }
    return booksData;
  } catch (error) {
    const defaultBook = {
      id: "1",
      name: "Sample Book",
      year: 2023,
      author: "Sample Author",
      summary: "A sample book summary.",
      publisher: "Sample Publisher",
      pageCount: 200,
      readPage: 0,
      finished: false,
      reading: false,
      insertedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const booksData = [defaultBook];
    saveBooks(booksData);
    return booksData;
  }
};

// Fungsi untuk menyimpan data ke file
const saveBooks = (booksData) => {
  fs.writeFileSync("books.json", JSON.stringify(booksData, null, 2));
};

// Inisialisasi data books dari file
let books = loadBooks();

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const { url, method } = req;

  if (url === "/") {
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        status: "success",
        message: "Welcome to Bookshelf API! Use /books to access the API.",
      })
    );
    return;
  }

  if (url === "/favicon.ico") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (url === "/books" || url === "/books/") {
    console.log(`Received ${method} request to ${url}`);
    if (method === "GET") {
      const query = new URLSearchParams(url.split("?")[1] || "");
      let filteredBooks = [...books];

      const name = query.get("name");
      const reading = query.get("reading");
      const finished = query.get("finished");

      if (name) {
        filteredBooks = filteredBooks.filter((book) =>
          book.name.toLowerCase().includes(name.toLowerCase())
        );
      }
      if (reading === "1") {
        filteredBooks = filteredBooks.filter((book) => book.reading);
      } else if (reading === "0") {
        filteredBooks = filteredBooks.filter((book) => !book.reading);
      }
      if (finished === "1") {
        filteredBooks = filteredBooks.filter((book) => book.finished);
      } else if (finished === "0") {
        filteredBooks = filteredBooks.filter((book) => !book.finished);
      }

      const response = {
        status: "success",
        data: {
          books: filteredBooks.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
        },
      };
      res.statusCode = 200;
      res.end(JSON.stringify(response));
    } else if (method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        console.log("Received body:", body);
        if (!body) {
          res.statusCode = 400;
          res.end(
            JSON.stringify({
              status: "fail",
              message:
                "Gagal menambahkan buku. Body request tidak boleh kosong",
            })
          );
          return;
        }

        try {
          const parsedBody = JSON.parse(body);

          if ("id" in parsedBody) {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                status: "fail",
                message:
                  'Gagal menambahkan buku. Properti "id" tidak diizinkan, akan dibuat otomatis oleh server',
              })
            );
            return;
          }

          const requiredFields = [
            "name",
            "year",
            "author",
            "summary",
            "publisher",
            "pageCount",
            "readPage",
            "reading",
          ];
          const missingFields = requiredFields.filter(
            (field) => !(field in parsedBody)
          );
          if (missingFields.length > 0) {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                status: "fail",
                message: `Gagal menambahkan buku. Properti berikut tidak boleh kosong: ${missingFields.join(
                  ", "
                )}`,
              })
            );
            return;
          }

          const {
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            reading,
          } = parsedBody;

          if (typeof name !== "string" || name.trim() === "") {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                status: "fail",
                message: "Gagal menambahkan buku. Mohon isi nama buku",
              })
            );
            return;
          }
          if (!Number.isInteger(year)) {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                status: "fail",
                message:
                  "Gagal menambahkan buku. Tahun harus berupa angka integer",
              })
            );
            return;
          }
          if (typeof author !== "string" || author.trim() === "") {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                status: "fail",
                message:
                  "Gagal menambahkan buku. Author harus berupa string yang valid",
              })
            );
            return;
          }
          if (typeof summary !== "string") {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                status: "fail",
                message: "Gagal menambahkan buku. Summary harus berupa string",
              })
            );
            return;
          }
          if (typeof publisher !== "string") {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                status: "fail",
                message:
                  "Gagal menambahkan buku. Publisher harus berupa string",
              })
            );
            return;
          }
          if (!Number.isInteger(pageCount) || pageCount < 0) {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                status: "fail",
                message:
                  "Gagal menambahkan buku. pageCount harus berupa angka integer non-negatif",
              })
            );
            return;
          }
          if (!Number.isInteger(readPage) || readPage < 0) {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                status: "fail",
                message:
                  "Gagal menambahkan buku. readPage harus berupa angka integer non-negatif",
              })
            );
            return;
          }
          if (typeof reading !== "boolean") {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                status: "fail",
                message: "Gagal menambahkan buku. reading harus berupa boolean",
              })
            );
            return;
          }

          if (readPage > pageCount) {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                status: "fail",
                message:
                  "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
              })
            );
            return;
          }

          const id = nanoid();
          const finished = pageCount === readPage;
          const insertedAt = new Date().toISOString();
          const updatedAt = insertedAt;

          const newBook = {
            id,
            name: name.trim(),
            year,
            author: author.trim(),
            summary,
            publisher,
            pageCount,
            readPage,
            finished,
            reading,
            insertedAt,
            updatedAt,
          };
          books.push(newBook);
          saveBooks(books);

          res.statusCode = 201;
          res.end(
            JSON.stringify({
              status: "success",
              message: "Buku berhasil ditambahkan",
              data: { bookId: id },
            })
          );
        } catch (error) {
          console.error(
            "Error parsing body:",
            error.message,
            "Raw body:",
            body
          );
          res.statusCode = 400;
          res.end(
            JSON.stringify({
              status: "fail",
              message: `Gagal menambahkan buku. Format JSON tidak valid: ${error.message}`,
            })
          );
        }
      });
    } else {
      res.statusCode = 405;
      res.end(
        JSON.stringify({
          status: "fail",
          message: "Method not allowed",
        })
      );
    }
  } else if (url.startsWith("/books/")) {
    const id = url.split("/")[2];
    const book = books.find((b) => b.id === id);

    if (method === "GET") {
      if (!book) {
        res.statusCode = 404;
        res.end(
          JSON.stringify({
            status: "fail",
            message: "Buku tidak ditemukan",
          })
        );
        return;
      }
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          status: "success",
          data: { book },
        })
      );
    } else if (method === "PUT") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        console.log("Received body for PUT:", body);
        if (!body) {
          res.statusCode = 400;
          res.end(
            JSON.stringify({
              status: "fail",
              message:
                "Gagal memperbarui buku. Body request tidak boleh kosong",
            })
          );
          return;
        }

        try {
          if (!book) {
            res.statusCode = 404;
            res.end(
              JSON.stringify({
                status: "fail",
                message: "Gagal memperbarui buku. Id tidak ditemukan",
              })
            );
            return;
          }

          const parsedBody = JSON.parse(body);

          const requiredFields = [
            "name",
            "year",
            "author",
            "summary",
            "publisher",
            "pageCount",
            "readPage",
            "reading",
          ];
          const missingFields = requiredFields.filter(
            (field) => !(field in parsedBody)
          );
          if (missingFields.length > 0) {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                status: "fail",
                message: `Gagal memperbarui buku. Properti berikut tidak boleh kosong: ${missingFields.join(
                  ", "
                )}`,
              })
            );
            return;
          }

          const {
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            reading,
          } = parsedBody;

          if (typeof name !== "string" || name.trim() === "") {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                status: "fail",
                message: "Gagal memperbarui buku. Mohon isi nama buku",
              })
            );
            return;
          }
          if (!Number.isInteger(year)) {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                status: "fail",
                message:
                  "Gagal memperbarui buku. Tahun harus berupa angka integer",
              })
            );
            return;
          }
          if (typeof author !== "string" || author.trim() === "") {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                status: "fail",
                message:
                  "Gagal memperbarui buku. Author harus berupa string yang valid",
              })
            );
            return;
          }
          if (typeof summary !== "string") {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                status: "fail",
                message: "Gagal memperbarui buku. Summary harus berupa string",
              })
            );
            return;
          }
          if (typeof publisher !== "string") {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                status: "fail",
                message:
                  "Gagal memperbarui buku. Publisher harus berupa string",
              })
            );
            return;
          }
          if (!Number.isInteger(pageCount) || pageCount < 0) {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                status: "fail",
                message:
                  "Gagal memperbarui buku. pageCount harus berupa angka integer non-negatif",
              })
            );
            return;
          }
          if (!Number.isInteger(readPage) || readPage < 0) {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                status: "fail",
                message:
                  "Gagal memperbarui buku. readPage harus berupa angka integer non-negatif",
              })
            );
            return;
          }
          if (typeof reading !== "boolean") {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                status: "fail",
                message: "Gagal memperbarui buku. reading harus berupa boolean",
              })
            );
            return;
          }

          if (readPage > pageCount) {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                status: "fail",
                message:
                  "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
              })
            );
            return;
          }

          book.name = name.trim();
          book.year = year;
          book.author = author.trim();
          book.summary = summary;
          book.publisher = publisher;
          book.pageCount = pageCount;
          book.readPage = readPage;
          book.finished = pageCount === readPage;
          book.reading = reading;
          book.updatedAt = new Date().toISOString();

          saveBooks(books);

          res.statusCode = 200;
          res.end(
            JSON.stringify({
              status: "success",
              message: "Buku berhasil diperbarui",
            })
          );
        } catch (error) {
          console.error(
            "Error parsing body for PUT:",
            error.message,
            "Raw body:",
            body
          );
          res.statusCode = 400;
          res.end(
            JSON.stringify({
              status: "fail",
              message: `Gagal memperbarui buku. Format JSON tidak valid: ${error.message}`,
            })
          );
        }
      });
    } else if (method === "DELETE") {
      if (!book) {
        res.statusCode = 404;
        res.end(
          JSON.stringify({
            status: "fail",
            message: "Buku gagal dihapus. Id tidak ditemukan",
          })
        );
        return;
      }
      books.splice(books.indexOf(book), 1);
      saveBooks(books);

      res.statusCode = 200;
      res.end(
        JSON.stringify({
          status: "success",
          message: "Buku berhasil dihapus",
        })
      );
    } else {
      res.statusCode = 405;
      res.end(
        JSON.stringify({
          status: "fail",
          message: "Method not allowed",
        })
      );
    }
  } else {
    res.statusCode = 404;
    res.end(
      JSON.stringify({
        status: "fail",
        message: "Not Found",
      })
    );
  }
});

server.listen(9000, () => {
  console.log("Server running on port 9000");
});
