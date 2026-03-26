import type { Card } from "@/types/game";

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 5;

interface CardTemplate {
  name: string;
  kind: Card["kind"];
  value: number;
  description: string;
  colors?: string[];
  count: number;
}

const cardTemplates: CardTemplate[] = [
  // Propiedades marrón (2)
  { name: "Mediterranean Avenue", kind: "property", value: 1, description: "Propiedad marrón.", colors: ["marron"], count: 1 },
  { name: "Baltic Avenue", kind: "property", value: 1, description: "Propiedad marrón.", colors: ["marron"], count: 1 },

  // Propiedades azul claro (3)
  { name: "Oriental Avenue", kind: "property", value: 1, description: "Propiedad azul claro.", colors: ["azul-claro"], count: 1 },
  { name: "Vermont Avenue", kind: "property", value: 1, description: "Propiedad azul claro.", colors: ["azul-claro"], count: 1 },
  { name: "Connecticut Avenue", kind: "property", value: 1, description: "Propiedad azul claro.", colors: ["azul-claro"], count: 1 },

  // Propiedades rosa (3)
  { name: "St. Charles Place", kind: "property", value: 2, description: "Propiedad rosa.", colors: ["rosa"], count: 1 },
  { name: "States Avenue", kind: "property", value: 2, description: "Propiedad rosa.", colors: ["rosa"], count: 1 },
  { name: "Virginia Avenue", kind: "property", value: 2, description: "Propiedad rosa.", colors: ["rosa"], count: 1 },

  // Propiedades naranja (3)
  { name: "St. James Place", kind: "property", value: 2, description: "Propiedad naranja.", colors: ["naranja"], count: 1 },
  { name: "Tennessee Avenue", kind: "property", value: 2, description: "Propiedad naranja.", colors: ["naranja"], count: 1 },
  { name: "New York Avenue", kind: "property", value: 2, description: "Propiedad naranja.", colors: ["naranja"], count: 1 },

  // Propiedades rojas (3)
  { name: "Kentucky Avenue", kind: "property", value: 3, description: "Propiedad roja.", colors: ["rojo"], count: 1 },
  { name: "Indiana Avenue", kind: "property", value: 3, description: "Propiedad roja.", colors: ["rojo"], count: 1 },
  { name: "Illinois Avenue", kind: "property", value: 3, description: "Propiedad roja.", colors: ["rojo"], count: 1 },

  // Propiedades amarillas (3)
  { name: "Atlantic Avenue", kind: "property", value: 3, description: "Propiedad amarilla.", colors: ["amarillo"], count: 1 },
  { name: "Ventnor Avenue", kind: "property", value: 3, description: "Propiedad amarilla.", colors: ["amarillo"], count: 1 },
  { name: "Marvin Gardens", kind: "property", value: 3, description: "Propiedad amarilla.", colors: ["amarillo"], count: 1 },

  // Propiedades verdes (3)
  { name: "Pacific Avenue", kind: "property", value: 4, description: "Propiedad verde.", colors: ["verde"], count: 1 },
  { name: "North Carolina Avenue", kind: "property", value: 4, description: "Propiedad verde.", colors: ["verde"], count: 1 },
  { name: "Pennsylvania Avenue", kind: "property", value: 4, description: "Propiedad verde.", colors: ["verde"], count: 1 },

  // Propiedades azul oscuro (2)
  { name: "Park Place", kind: "property", value: 4, description: "Propiedad azul oscuro.", colors: ["azul-oscuro"], count: 1 },
  { name: "Boardwalk", kind: "property", value: 4, description: "Propiedad azul oscuro.", colors: ["azul-oscuro"], count: 1 },

  // Ferrocarriles (4)
  { name: "Reading Railroad", kind: "property", value: 2, description: "Ferrocarril.", colors: ["ferrocarril"], count: 1 },
  { name: "Pennsylvania Railroad", kind: "property", value: 2, description: "Ferrocarril.", colors: ["ferrocarril"], count: 1 },
  { name: "B&O Railroad", kind: "property", value: 2, description: "Ferrocarril.", colors: ["ferrocarril"], count: 1 },
  { name: "Short Line", kind: "property", value: 2, description: "Ferrocarril.", colors: ["ferrocarril"], count: 1 },

  // Servicios públicos (2)
  { name: "Electric Company", kind: "property", value: 2, description: "Servicio público.", colors: ["servicio"], count: 1 },
  { name: "Water Works", kind: "property", value: 2, description: "Servicio público.", colors: ["servicio"], count: 1 },

  // Comodines multicolor (2)
  { name: "Comodín Multicolor", kind: "wild", value: 0, description: "Sirve para cualquier color.", colors: ["multicolor"], count: 2 },

  // Comodines dobles (9)
  { name: "Comodín Azul Claro/Marrón", kind: "wild", value: 0, description: "Sirve como propiedad de dos colores.", colors: ["azul-claro", "marron"], count: 1 },
  { name: "Comodín Rosa/Naranja", kind: "wild", value: 0, description: "Sirve como propiedad de dos colores.", colors: ["rosa", "naranja"], count: 1 },
  { name: "Comodín Rojo/Amarillo", kind: "wild", value: 0, description: "Sirve como propiedad de dos colores.", colors: ["rojo", "amarillo"], count: 1 },
  { name: "Comodín Verde/Azul Oscuro", kind: "wild", value: 0, description: "Sirve como propiedad de dos colores.", colors: ["verde", "azul-oscuro"], count: 1 },
  { name: "Comodín Verde/Ferrocarril", kind: "wild", value: 0, description: "Sirve como propiedad de dos colores.", colors: ["verde", "ferrocarril"], count: 1 },
  { name: "Comodín Azul Claro/Ferrocarril", kind: "wild", value: 0, description: "Sirve como propiedad de dos colores.", colors: ["azul-claro", "ferrocarril"], count: 1 },
  { name: "Comodín Ferrocarril/Servicio", kind: "wild", value: 0, description: "Sirve como propiedad de dos colores.", colors: ["ferrocarril", "servicio"], count: 1 },
  { name: "Comodín Servicio/Azul Claro", kind: "wild", value: 0, description: "Sirve como propiedad de dos colores.", colors: ["servicio", "azul-claro"], count: 1 },
  { name: "Comodín Marrón/Servicio", kind: "wild", value: 0, description: "Sirve como propiedad de dos colores.", colors: ["marron", "servicio"], count: 1 },

  { name: "Roba-Negocios", kind: "action", value: 5, description: "Roba un grupo completo de propiedades.", count: 2 },
  { name: "Intercambio Forzado", kind: "action", value: 3, description: "Intercambia una propiedad con otro jugador.", count: 3 },
  { name: "Trato Astuto", kind: "action", value: 3, description: "Roba una propiedad que no sea de grupo completo.", count: 3 },
  { name: "Di Que No", kind: "action", value: 4, description: "Cancela una carta de acción contra ti o a favor tuyo.", count: 3 },
  { name: "Cobro 5M", kind: "action", value: 3, description: "Un jugador te paga 5M.", count: 2 },
  { name: "Cobro 10M", kind: "action", value: 3, description: "Todos los jugadores te pagan hasta sumar 10M.", count: 1 },
  { name: "Casa", kind: "action", value: 3, description: "Suma valor de alquiler a grupo completo.", count: 3 },
  { name: "Hotel", kind: "action", value: 4, description: "Suma valor de alquiler a grupo con casa.", count: 2 },
  { name: "Pasa por la Salida", kind: "action", value: 1, description: "Roba 2 cartas extra.", count: 10 },

  { name: "Alquiler Azul Claro/Marrón", kind: "rent", value: 1, description: "Cobra alquiler de esos colores.", colors: ["azul-claro", "marron"], count: 2 },
  { name: "Alquiler Rosa/Naranja", kind: "rent", value: 1, description: "Cobra alquiler de esos colores.", colors: ["rosa", "naranja"], count: 2 },
  { name: "Alquiler Rojo/Amarillo", kind: "rent", value: 1, description: "Cobra alquiler de esos colores.", colors: ["rojo", "amarillo"], count: 2 },
  { name: "Alquiler Azul Oscuro/Verde", kind: "rent", value: 1, description: "Cobra alquiler de esos colores.", colors: ["azul-oscuro", "verde"], count: 2 },
  { name: "Alquiler Ferrocarril/Servicio", kind: "rent", value: 1, description: "Cobra alquiler de esos colores.", colors: ["ferrocarril", "servicio"], count: 2 },
  { name: "Alquiler Multicolor", kind: "rent", value: 3, description: "Cobra alquiler de cualquier color.", colors: ["multicolor"], count: 3 },

  { name: "Dinero 1M", kind: "money", value: 1, description: "Carta de dinero.", count: 6 },
  { name: "Dinero 2M", kind: "money", value: 2, description: "Carta de dinero.", count: 5 },
  { name: "Dinero 3M", kind: "money", value: 3, description: "Carta de dinero.", count: 3 },
  { name: "Dinero 4M", kind: "money", value: 4, description: "Carta de dinero.", count: 3 },
  { name: "Dinero 5M", kind: "money", value: 5, description: "Carta de dinero.", count: 2 },
  { name: "Dinero 10M", kind: "money", value: 10, description: "Carta de dinero.", count: 1 },
];

export const PLAYABLE_CARDS_COUNT = cardTemplates.reduce(
  (total, template) => total + template.count,
  0,
);

export const DECK_BREAKDOWN = {
  properties: cardTemplates
    .filter((template) => template.kind === "property")
    .reduce((total, template) => total + template.count, 0),
  wilds: cardTemplates
    .filter((template) => template.kind === "wild")
    .reduce((total, template) => total + template.count, 0),
  money: cardTemplates
    .filter((template) => template.kind === "money")
    .reduce((total, template) => total + template.count, 0),
  actions: cardTemplates
    .filter((template) => template.kind === "action" || template.kind === "rent")
    .reduce((total, template) => total + template.count, 0),
};

export function createDeck(): Card[] {
  let serial = 0;

  return cardTemplates.flatMap((template) =>
    Array.from({ length: template.count }, (_, index) => {
      serial += 1;
      return {
        id: `${template.name}-${index + 1}-${serial}`,
        name: template.name,
        kind: template.kind,
        value: template.value,
        description: template.description,
        colors: template.colors,
      } as Card;
    }),
  );
}
