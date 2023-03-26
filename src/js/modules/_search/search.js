let g_sourceInfo;

function getUnitName(pageInfo, unitInfo) {
  return pageInfo[unitInfo.pageKey].title;
}

function makeList(bid, title, pageInfo, matchArray) {
  return `
    <h3>${title[bid]} (${matchArray.length})</h3>
    <div class="ui list">
      ${matchArray.map((m, hidx) => `
        <div class="item">
          <i class="book icon"></i>
          <div class="content">
            <div class="header">
              ${getUnitName(pageInfo, m)} (${m.m.length})
            </div>
            <div class="list">
              ${m.m.map((h, midx) => `
                <div class="item">
                  <i class="search icon"></i>
                  <div class="content">
                    <div class="header">
                      <i data-bid="${bid}" data-m="${midx}" data-h="${hidx}" class="edit-match trash green icon"></i>
                      <a href="${pageInfo[m.pageKey].url}?srch=${h.location}">Paragraph ${h.location.substr(1)}</a>
                    </div>
                    <div class="description">
                      ${h.context}
                    </div>
                  </div>
                  </div> <!-- item -->
              `).join("")}
            </div> <!-- list -->
          </div>
        </div>
      `).join("")}
    </div> <!-- ui list -->
  `;
}

//show saved query result in modal
export function generateHTML(queryResult) {
  const books = g_sourceInfo.keyInfo.getBooks();
  let html = "";

  //generate html for search hits
  for (let bid of books) {
    if (queryResult.data[bid]) {
      html += makeList(bid, queryResult.titleArray, queryResult.pageInfo, queryResult.data[bid]);
    }
  }

  return html;
}

export function searchInit(si) {
  g_sourceInfo = si;
  g_sourceInfo.generateHTML = generateHTML;

  return g_sourceInfo;
}


