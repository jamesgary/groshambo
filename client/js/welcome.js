module.exports = {
  generateNamePicker: function(host, callback) {
    $.ajax("//" + host + "/names").done(msg => {
      let names = JSON.parse(msg);
      let namesHtml = "";
      for (let i = 0; i < names.length; i++) {
        namesHtml += `<a role="name" data-name="${names[i][0]}" data-id="${names[i][1]}">${names[i][0]}</a>`;
      }
      namesHtml += `<a class="generate-more" role="generate-more">Generate more names</a>`;

      $("[role=name-list]").html(namesHtml);
      $("[role=generate-more]").click(this.generateNamePicker);
      $("[role=name]").click(function(evt) {
        let nameData = $(evt.target).data();
        $("[role=welcome]").hide();
        callback(nameData.name, nameData.id);
      });
    });
  }
}
