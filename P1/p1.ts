const hanoi = (discos: number, torreI: string, torreF: string, torreAux: string):void => {

    if(discos===1){
        console.log("Se ha movido el disco "+discos+" de la "+torreI+" a la "+torreF)
    }
    else{
        hanoi(discos-1, torreI, torreAux, torreF)
        console.log("Se ha movido el disco "+discos+" de la "+torreI+" a la "+torreF)
        hanoi(discos-1, torreAux, torreF, torreI)
    }
}

hanoi(3, "Torre Inicial", "Torre Final", "Torre Auxiliar")

