import asyncio

from sqlmodel import select

from app.db.session import async_session_maker, init_db
from app.models.item import Item

BIERES = [
    {"titre": "Chimay Bleue", "categorie": "Trappiste", "description": "Bière brune riche aux notes de fruits secs et d'épices.", "image_url": "https://example.com/chimay-bleue.jpg", "annee": 1948, "brasserie": "Abbaye de Chimay", "degre_alcool": 9.0},
    {"titre": "Orval", "categorie": "Trappiste", "description": "Bière ambrée sèche et houblonnée, affinée en bouteille.", "image_url": "https://example.com/orval.jpg", "annee": 1931, "brasserie": "Abbaye d'Orval", "degre_alcool": 6.2},
    {"titre": "Westmalle Triple", "categorie": "Trappiste", "description": "Triple dorée, ronde et légèrement épicée.", "image_url": "https://example.com/westmalle-triple.jpg", "annee": 1934, "brasserie": "Abbaye de Westmalle", "degre_alcool": 9.5},
    {"titre": "Rochefort 8", "categorie": "Trappiste", "description": "Brune puissante aux arômes de fruits mûrs.", "image_url": "https://example.com/rochefort8.jpg", "annee": 1955, "brasserie": "Abbaye de Rochefort", "degre_alcool": 9.2},

    {"titre": "Punk IPA", "categorie": "IPA", "description": "IPA moderne aux agrumes et résine de houblon.", "image_url": "https://example.com/punk-ipa.jpg", "annee": 2007, "brasserie": "BrewDog", "degre_alcool": 5.6},
    {"titre": "Sculpin IPA", "categorie": "IPA", "description": "IPA californienne fruitée et florale.", "image_url": "https://example.com/sculpin.jpg", "annee": 2007, "brasserie": "Ballast Point", "degre_alcool": 7.0},
    {"titre": "Lagunitas IPA", "categorie": "IPA", "description": "IPA équilibrée entre amertume et malt caramel.", "image_url": "https://example.com/lagunitas.jpg", "annee": 1995, "brasserie": "Lagunitas Brewing", "degre_alcool": 6.2},
    {"titre": "Neipa Juicy", "categorie": "IPA", "description": "New England IPA trouble, très fruitée et douce.", "image_url": "https://example.com/neipa-juicy.jpg", "annee": 2018, "brasserie": "Brasserie du Mont Blanc", "degre_alcool": 6.5},
    {"titre": "Session IPA Light", "categorie": "IPA", "description": "IPA légère et facile à boire, peu alcoolisée.", "image_url": "https://example.com/session-ipa.jpg", "annee": 2015, "brasserie": "Founders Brewing", "degre_alcool": 4.5},

    {"titre": "1664", "categorie": "Blonde", "description": "Blonde française légère et rafraîchissante.", "image_url": "https://example.com/1664.jpg", "annee": 1952, "brasserie": "Kronenbourg", "degre_alcool": 5.5},
    {"titre": "Leffe Blonde", "categorie": "Blonde", "description": "Blonde belge maltée aux notes épicées.", "image_url": "https://example.com/leffe-blonde.jpg", "annee": 1240, "brasserie": "Abbaye de Leffe", "degre_alcool": 6.6},
    {"titre": "Pilsner Urquell", "categorie": "Blonde", "description": "Pils tchèque originelle, houblonnée et croquante.", "image_url": "https://example.com/pilsner-urquell.jpg", "annee": 1842, "brasserie": "Pilsner Urquell", "degre_alcool": 4.4},
    {"titre": "Grimbergen Blonde", "categorie": "Blonde", "description": "Blonde d'abbaye douce et légèrement sucrée.", "image_url": "https://example.com/grimbergen.jpg", "annee": 1128, "brasserie": "Grimbergen", "degre_alcool": 6.7},
    {"titre": "Heineken", "categorie": "Blonde", "description": "Blonde internationale légère au goût neutre.", "image_url": "https://example.com/heineken.jpg", "annee": 1873, "brasserie": "Heineken", "degre_alcool": 5.0},

    {"titre": "Guinness Draught", "categorie": "Stout", "description": "Stout irlandais crémeux aux notes torréfiées.", "image_url": "https://example.com/guinness.jpg", "annee": 1759, "brasserie": "Guinness", "degre_alcool": 4.2},
    {"titre": "Founders Breakfast Stout", "categorie": "Stout", "description": "Stout imperial au café et à l'avoine.", "image_url": "https://example.com/breakfast-stout.jpg", "annee": 2004, "brasserie": "Founders Brewing", "degre_alcool": 8.3},
    {"titre": "Left Hand Milk Stout", "categorie": "Stout", "description": "Stout doux et velouté au lactose.", "image_url": "https://example.com/milk-stout.jpg", "annee": 1994, "brasserie": "Left Hand Brewing", "degre_alcool": 6.0},
    {"titre": "Mackeson Stout", "categorie": "Stout", "description": "Stout anglais sucré aux notes de caramel.", "image_url": "https://example.com/mackeson.jpg", "annee": 1907, "brasserie": "Mackeson", "degre_alcool": 3.0},

    {"titre": "Hoegaarden", "categorie": "Blanche", "description": "Blanche belge aux épices et écorces d'orange.", "image_url": "https://example.com/hoegaarden.jpg", "annee": 1966, "brasserie": "Hoegaarden Brewery", "degre_alcool": 4.9},
    {"titre": "Blanche de Bruxelles", "categorie": "Blanche", "description": "Blanche douce et voilée aux notes de coriandre.", "image_url": "https://example.com/blanche-bruxelles.jpg", "annee": 1981, "brasserie": "Lefebvre", "degre_alcool": 4.5},
    {"titre": "Blue Moon", "categorie": "Blanche", "description": "Blanche américaine aux notes d'agrumes.", "image_url": "https://example.com/blue-moon.jpg", "annee": 1995, "brasserie": "Blue Moon Brewing", "degre_alcool": 5.4},
    {"titre": "Weihenstephaner Hefeweissbier", "categorie": "Blanche", "description": "Weizen bavaroise aux arômes de banane et clou de girofle.", "image_url": "https://example.com/weihenstephaner.jpg", "annee": 1040, "brasserie": "Weihenstephan", "degre_alcool": 5.4},

    {"titre": "La Chouffe", "categorie": "Ambrée", "description": "Ambrée belge épicée et légèrement fruitée.", "image_url": "https://example.com/chouffe.jpg", "annee": 1982, "brasserie": "Brasserie d'Achouffe", "degre_alcool": 8.0},
    {"titre": "Grimbergen Ambrée", "categorie": "Ambrée", "description": "Ambrée d'abbaye aux notes de caramel.", "image_url": "https://example.com/grimbergen-ambree.jpg", "annee": 1128, "brasserie": "Grimbergen", "degre_alcool": 6.5},
    {"titre": "Fischer Amber", "categorie": "Ambrée", "description": "Ambrée française maltée et ronde.", "image_url": "https://example.com/fischer-amber.jpg", "annee": 1821, "brasserie": "Fischer", "degre_alcool": 6.0},
    {"titre": "Newcastle Brown Ale", "categorie": "Ambrée", "description": "Ambrée anglaise douce aux notes de noisette.", "image_url": "https://example.com/newcastle.jpg", "annee": 1927, "brasserie": "Newcastle Brewery", "degre_alcool": 4.7},

    {"titre": "Cantillon Gueuze", "categorie": "Sour", "description": "Gueuze lambic acidulée et sauvage.", "image_url": "https://example.com/cantillon.jpg", "annee": 1900, "brasserie": "Cantillon", "degre_alcool": 5.0},
    {"titre": "Rodenbach Grand Cru", "categorie": "Sour", "description": "Flamande rouge acidulée vieillie en fût de chêne.", "image_url": "https://example.com/rodenbach.jpg", "annee": 1836, "brasserie": "Rodenbach", "degre_alcool": 6.0},
    {"titre": "Duchesse de Bourgogne", "categorie": "Sour", "description": "Flamande rouge douce-amère aux notes de cerise.", "image_url": "https://example.com/duchesse.jpg", "annee": 1946, "brasserie": "Verhaeghe", "degre_alcool": 6.2},
    {"titre": "Berliner Weisse", "categorie": "Sour", "description": "Bière allemande acidulée et légère.", "image_url": "https://example.com/berliner-weisse.jpg", "annee": 1700, "brasserie": "Brasserie de Berlin", "degre_alcool": 3.0},

    {"titre": "Chimay Rouge", "categorie": "Brune", "description": "Brune trappiste douce aux notes de fruits secs.", "image_url": "https://example.com/chimay-rouge.jpg", "annee": 1862, "brasserie": "Abbaye de Chimay", "degre_alcool": 7.0},
    {"titre": "Maredsous 8", "categorie": "Brune", "description": "Brune d'abbaye maltée et ronde.", "image_url": "https://example.com/maredsous.jpg", "annee": 1963, "brasserie": "Maredsous", "degre_alcool": 8.0},
    {"titre": "Affligem Brune", "categorie": "Brune", "description": "Brune belge aux notes de caramel et de réglisse.", "image_url": "https://example.com/affligem-brune.jpg", "annee": 1074, "brasserie": "Affligem", "degre_alcool": 6.8},
    {"titre": "Ename Dubbel", "categorie": "Brune", "description": "Double brune épicée et fruitée.", "image_url": "https://example.com/ename.jpg", "annee": 1990, "brasserie": "Brouwerij Roman", "degre_alcool": 6.5},

    {"titre": "Delirium Tremens", "categorie": "Triple", "description": "Triple belge forte aux notes fruitées et épicées.", "image_url": "https://example.com/delirium.jpg", "annee": 1988, "brasserie": "Huyghe Brewery", "degre_alcool": 8.5},
    {"titre": "Tripel Karmeliet", "categorie": "Triple", "description": "Triple aux trois céréales, douce et florale.", "image_url": "https://example.com/karmeliet.jpg", "annee": 1996, "brasserie": "Bosteels", "degre_alcool": 8.4},
    {"titre": "St. Bernardus Tripel", "categorie": "Triple", "description": "Triple ronde et légèrement sucrée.", "image_url": "https://example.com/st-bernardus.jpg", "annee": 1946, "brasserie": "St. Bernardus", "degre_alcool": 8.0},
    {"titre": "Val-Dieu Triple", "categorie": "Triple", "description": "Triple d'abbaye belge, ronde et maltée.", "image_url": "https://example.com/val-dieu.jpg", "annee": 1997, "brasserie": "Abbaye du Val-Dieu", "degre_alcool": 9.0},
    
    {"titre": "Goose Island IPA", "categorie": "IPA", "description": "IPA américaine équilibrée entre houblon et malt.", "image_url": "https://example.com/goose-island.jpg", "annee": 1988, "brasserie": "Goose Island", "degre_alcool": 5.9},
    {"titre": "Chimay Triple", "categorie": "Trappiste", "description": "Triple dorée et sèche, notes d'épices et de houblon.", "image_url": "https://example.com/chimay-triple.jpg", "annee": 1966, "brasserie": "Abbaye de Chimay", "degre_alcool": 8.0},
]


async def seed() -> None:
    await init_db()

    ajoutes = 0
    ignores = 0

    async with async_session_maker() as session:
        for biere in BIERES:
            result = await session.exec(select(Item).where(Item.titre == biere["titre"]))
            if result.first() is not None:
                ignores += 1
                continue

            item = Item(**biere)
            session.add(item)
            ajoutes += 1

        await session.commit()

    print(f"Seed terminé : {ajoutes} bières ajoutées, {ignores} déjà présentes (ignorées).")


if __name__ == "__main__":
    asyncio.run(seed())