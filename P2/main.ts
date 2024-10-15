type Producto = {
  id: number,
  name: string,
  price: number,
}

const productos:Producto[] = [
  {
    id: 1,
    name: "raton",
    price: 8
  },
  {
    id: 2,
    name: "silla",
    price: 15
  },
  {
    id: 3,
    name: "teclado",
    price: 30
  },
  {
    id: 4,
    name: "boligrafo",
    price: 2
  }
  
]

const handler = async (req: Request):Promise<Response> => {

  const method = req.method
  const url = new URL(req.url)
  const path = url.pathname
  const searchParams = url.searchParams

  const arrPrecios = productos.map((elem:Producto) => elem.price)
  const maxPriceGlobal = Math.max(...arrPrecios)
  const minPriceGlobal = Math.min(...arrPrecios)

  if(method === "GET"){

    // Ruta 1: /productos

    if(path === "/productos"){

      if(searchParams.get("minPrice") && !searchParams.get("maxPrice")){
        if(Number(searchParams.get("minPrice"))>maxPriceGlobal){
          return new Response("No existen productos en el rango de precio indicado", {status: 402})
        }
        const productosFiltrados = productos.filter((elem:Producto) => elem.price >= Number(searchParams.get("minPrice")))
        return new Response(JSON.stringify(productosFiltrados))
      }
      else if(!searchParams.get("minPrice") && searchParams.get("maxPrice")){
        if(Number(searchParams.get("maxPrice"))<minPriceGlobal){
          return new Response("No existen productos en el rango de precio indicado", {status: 402})
        }
        const productosFiltrados = productos.filter((elem:Producto) => elem.price <= Number(searchParams.get("maxPrice")))
        return new Response(JSON.stringify(productosFiltrados))
      }
      else if(searchParams.get("minPrice") && searchParams.get("maxPrice")){
        if(Number(searchParams.get("minPrice"))>maxPriceGlobal || Number(searchParams.get("maxPrice"))<minPriceGlobal){
          return new Response("No existen productos en el rango de precio indicado", {status: 402})
        }
        const productosFiltrados = productos.filter((elem:Producto) => elem.price <= Number(searchParams.get("maxPrice")) && elem.price >= Number(searchParams.get("minPrice")))
        return new Response(JSON.stringify(productosFiltrados))
      }

      return new Response(JSON.stringify(productos))
    }   

    //Ruta 2: /productos/:id

    else if(path.startsWith("/producto/")){
      const idProducto:number = Number(path.split("/producto/")[1])
      const p:Producto = productos.find((elem: Producto) => elem.id === idProducto)
      if(!p){
        return new Response("No existe un producto con el ID indicado")
      }
      return new Response(JSON.stringify(p))
    }

    //Ruta 3: /calcular promedio

    else if(path === "/calcular-promedio"){
      
      if(searchParams.get("minPrice") && !searchParams.get("maxPrice")){

        if(Number(searchParams.get("minPrice"))>maxPriceGlobal){
          return new Response("No existen productos en el rango de precio indicado", {status: 402})
        }

        const productosFiltrados = productos.filter((elem:Producto) => elem.price >= Number(searchParams.get("minPrice")))
        const precioPromedio:number = productosFiltrados.reduce((acc:number ,elem:Producto) => {
          return acc+elem.price
        }, 0) / productosFiltrados.length
        return new Response(precioPromedio.toString())
      }
      else if(!searchParams.get("minPrice") && searchParams.get("maxPrice")){

        if(Number(searchParams.get("maxPrice"))<minPriceGlobal){
          return new Response("No existen productos en el rango de precio indicado", {status: 402})
        }

        const productosFiltrados = productos.filter((elem:Producto) => elem.price <= Number(searchParams.get("maxPrice")))
        const precioPromedio:number = productosFiltrados.reduce((acc:number ,elem:Producto) => {
          return acc+elem.price
        }, 0) / productosFiltrados.length
        return new Response(precioPromedio.toString())
      }
      else if(searchParams.get("minPrice") && searchParams.get("maxPrice")){

        if(Number(searchParams.get("maxPrice"))<maxPriceGlobal || Number(searchParams.get("minPrice"))>minPriceGlobal){
          return new Response("No existen productos en el rango de precio indicado", {status: 402})
        }

        const productosFiltrados = productos.filter((elem:Producto) => elem.price <= Number(searchParams.get("maxPrice")) && elem.price >= Number(searchParams.get("minPrice")))
        const precioPromedio:number = productosFiltrados.reduce((acc:number ,elem:Producto) => {
          return acc+elem.price
        }, 0) / productosFiltrados.length
        return new Response(precioPromedio.toString())
      }

      const precioPromedio:number = productos.reduce((acc:number ,elem:Producto) => {
        return acc+elem.price
      }, 0) / productos.length
      
      return new Response(precioPromedio.toString())
    }
    
  }

  return new Response ("Endpoint not found", {status: 404})

}

Deno.serve({port: 3000}, handler)