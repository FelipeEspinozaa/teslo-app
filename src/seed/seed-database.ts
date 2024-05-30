import { initialData } from "./seed";
import prisma from '../lib/prisma';

async function main() {
    
    //1. Borrar registros previos
    
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    

    const { categories, products } = initialData;

    // Categorias
    // {
    //     name: "Shirt"
    // }
    const categoriesData = categories.map( category => ({
        name: category
    }))
    await prisma.category.createMany({
        data: categoriesData
    })
    
    const categoriesDB = await prisma.category.findMany();

    const categoriesMap = categoriesDB.reduce( (map, category) => {
        map[ category.name.toLowerCase() ] = category.id;
        return map;
    }, {} as Record<string, string>) //<string= shirt, string=categoryID
    
    
    // Productos
    products.forEach( async(product) => {

        const { type, images, ...rest } = product;
        
        const dbProduct = await prisma.product.create({
            data: {
                ...rest,
                categoryId: categoriesMap[type]
            }
        })


        // Images
        const imagesData = images.map( image => ({
            url: image,
            productId: dbProduct.id
        }));

        await prisma.productImage.createMany({
            data: imagesData
        })


    })
    
    
    
    
    
    console.log("Seed Ejecutado correctamente");
}


// Funcion anonima autoejecutable
(() => {
    if (process.env.NODE_ENV == 'production') return; //no se ejecutara el seed, para que no borre la bbdd

    main();

})();