var loaded = false;

$('#main-page').live('pageshow', show_progress_loader);
$('#main-page').live('pageinit', load_repos);

function show_progress_loader() {
    if (!loaded) {
        $.mobile.showPageLoadingMsg();
    }
}

function load_repos() {
    $.getJSON('https://api.github.com/users/ealden/repos?callback=?', function(data) {
        $.each(data.data, function(index, repo) {
            $('#repo-list ul').append(
                $('<li>').append(
                    $('<a>').attr('href', '#').append(repo.name)));
        });

        $('#repo-list ul').listview('refresh');

        $.mobile.hidePageLoadingMsg();
        loaded = true;
    });
}