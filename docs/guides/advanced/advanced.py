import matplotlib.pyplot as plt
import pandas as pd
import morethemes as mt

from plotjs import InteractivePlot

mt.set_theme("wsj")

path = "https://raw.githubusercontent.com/holtzy/The-Python-Graph-Gallery/master/static/data/economic_data.csv"
df = pd.read_csv(path)
df["date"] = pd.to_datetime(df["date"])
col_to_update = [
    "unemployment rate",
    "cpi yoy",
    "core cpi",
    "gdp yoy",
    "interest rates",
]
for col in col_to_update:
    df[col] = df[col].str.replace("%", "").astype(float)
df.head()

fig, ax = plt.subplots()


for country in df.country.unique():
    df_country = df[df["country"] == country]
    ax.plot(df_country["date"], df_country["unemployment rate"])

InteractivePlot(
    fig=fig,
    tooltip=df.country.str.title().unique(),
).add_css(
    {
        "stroke": "black",
        "stroke-width": "15px",
        "transition": "all 0.3s ease",
    },
    selector=".line.hovered",
).add_css(
    {"stroke": "grey"},
    selector=".line.not-hovered",
).add_css(
    {
        "width": "120px",
        "text-align": "center",
        "font-size": "1.1em",
    },
    selector=".tooltip",
).save("docs/guides/advanced/advanced.html")
