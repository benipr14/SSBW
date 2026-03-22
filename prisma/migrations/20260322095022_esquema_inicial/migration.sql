-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "título" CHAR(127) NOT NULL,
    "descripción" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "imagen" CHAR(127) NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);
