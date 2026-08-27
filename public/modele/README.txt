Tu wgraj modele 3D systemow (.glb).

Podpiecie: pole `modelUrl` przy wywolaniu defineSystem w src/catalog/dataset.ts
(trafia do `model3d.url` rekordu systemu):

  defineSystem({
    id: "mb-86n",
    ...
    modelUrl: "/modele/mb-86n.glb",
  })

Bez `modelUrl` sekcja pokazuje model parametryczny (wlasny, pogladowy)
odpowiadajacy typowi konstrukcji - i mowi o tym wprost.

Formaty .rvt / .ifc / .dwg trzeba przekonwertowac do .glb (np. w Blenderze).

UWAGA: modele producenta wymagaja pisemnej zgody na publikacje - patrz MATERIALY.md.
