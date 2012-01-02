function blackberry_news_feed_menu() {
    var menu_refresh = new blackberry.ui.menu.MenuItem(false, 0, "Refresh", load_news_feed);
    var menu_separator_1 = new blackberry.ui.menu.MenuItem(true, 1);

    blackberry.ui.menu.clearMenuItems();
    blackberry.ui.menu.addMenuItem(menu_refresh);
    blackberry.ui.menu.addMenuItem(menu_separator_1);
}

function blackberry_your_actions_menu() {
    var menu_refresh = new blackberry.ui.menu.MenuItem(false, 0, "Refresh", load_your_actions);
    var menu_separator_1 = new blackberry.ui.menu.MenuItem(true, 1);

    blackberry.ui.menu.clearMenuItems();
    blackberry.ui.menu.addMenuItem(menu_refresh);
    blackberry.ui.menu.addMenuItem(menu_separator_1);
}

function blackberry_repos_menu() {
    var menu_refresh = new blackberry.ui.menu.MenuItem(false, 0, "Refresh", load_repos);
    var menu_separator_1 = new blackberry.ui.menu.MenuItem(true, 1);

    blackberry.ui.menu.clearMenuItems();
    blackberry.ui.menu.addMenuItem(menu_refresh);
    blackberry.ui.menu.addMenuItem(menu_separator_1);
}
