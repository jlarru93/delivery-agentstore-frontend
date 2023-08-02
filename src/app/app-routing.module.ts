import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { DashboardDemoComponent } from './demo/view/dashboarddemo.component';
import { FormLayoutDemoComponent } from './demo/view/formlayoutdemo.component';
import { FloatLabelDemoComponent } from './demo/view/floatlabeldemo.component';
import { InvalidStateDemoComponent } from './demo/view/invalidstatedemo.component';
import { InputDemoComponent } from './demo/view/inputdemo.component';
import { ButtonDemoComponent } from './demo/view/buttondemo.component';
import { TableDemoComponent } from './demo/view/tabledemo.component';
import { ListDemoComponent } from './demo/view/listdemo.component';
import { TreeDemoComponent } from './demo/view/treedemo.component';
import { PanelsDemoComponent } from './demo/view/panelsdemo.component';
import { OverlaysDemoComponent } from './demo/view/overlaysdemo.component';
import { MediaDemoComponent } from './demo/view/mediademo.component';
import { MenusDemoComponent } from './demo/view/menusdemo.component';
import { MessagesDemoComponent } from './demo/view/messagesdemo.component';
import { MiscDemoComponent } from './demo/view/miscdemo.component';
import { EmptyDemoComponent } from './demo/view/emptydemo.component';
import { ChartsDemoComponent } from './demo/view/chartsdemo.component';
import { FileDemoComponent } from './demo/view/filedemo.component';
import { DocumentationComponent } from './demo/view/documentation.component';
import { DisplayComponent } from './utilities/display.component';
import { ElevationComponent } from './utilities/elevation.component';
import { FlexboxComponent } from './utilities/flexbox.component';
import { GridComponent } from './utilities/grid.component';
import { IconsComponent } from './utilities/icons.component';
import { WidgetsComponent } from './utilities/widgets.component';
import { SpacingComponent } from './utilities/spacing.component';
import { TypographyComponent } from './utilities/typography.component';
import { TextComponent } from './utilities/text.component';

import { AppMainComponent } from './app.main.component';
import { AppNotfoundComponent } from './pages/app.notfound.component';
import { AppErrorComponent } from './pages/app.error.component';
import { AppAccessdeniedComponent } from './pages/app.accessdenied.component';
import { AppCrudComponent } from './pages/app.crud.component';
import { AppCalendarComponent } from './pages/app.calendar.component';
import { AppTimelineDemoComponent } from './pages/app.timelinedemo.component';
import { IsAuthenticated } from './utils/auth-guard';
import { SignInComponent } from './login/sign-in/sign-in.component';
import { RequestTripComponent } from './modules/request-trip/request-trip.component';

const routes: Routes = [
    {
        path: '', component: AppMainComponent,
        canActivate: [IsAuthenticated],
        children: [
            //APP
            {
                path: "main",
                loadChildren: () => import('./modules/main/main.module').then(m => m.MainModule), canActivate: [IsAuthenticated]
            },
            {
                path: "product",
                loadChildren: () => import('./modules/product/product.module').then(m => m.ProductModule), canActivate: [IsAuthenticated]
            },
            
            {
                path: "request-trip",
                loadChildren: () => import('./modules/request-trip/request-trip.module').then(m => m.RequestTripModule)
            },
            {
                path: "order-history",
                loadChildren: () => import('./modules/order-history/order-history.module').then(m => m.OrderHistoryModule)
            },
            {
                path: "complaint-report",
                loadChildren: () => import('./modules/complaint-report/complaint-report.module').then(m => m.ComplaintReportModule)
            },
            //THEME
            { path: '', component: DashboardDemoComponent },
            { path: 'uikit/formlayout', component: FormLayoutDemoComponent },
            { path: 'uikit/floatlabel', component: FloatLabelDemoComponent },
            { path: 'uikit/invalidstate', component: InvalidStateDemoComponent },
            { path: 'uikit/input', component: InputDemoComponent },
            { path: 'uikit/button', component: ButtonDemoComponent },
            { path: 'uikit/table', component: TableDemoComponent },
            { path: 'uikit/list', component: ListDemoComponent },
            { path: 'uikit/tree', component: TreeDemoComponent },
            { path: 'uikit/panel', component: PanelsDemoComponent },
            { path: 'uikit/overlay', component: OverlaysDemoComponent },
            { path: 'uikit/media', component: MediaDemoComponent },
            { path: 'uikit/menu', component: MenusDemoComponent },
            { path: 'uikit/message', component: MessagesDemoComponent },
            { path: 'uikit/misc', component: MiscDemoComponent },
            { path: 'uikit/charts', component: ChartsDemoComponent },
            { path: 'uikit/file', component: FileDemoComponent },
            { path: 'utilities/display', component: DisplayComponent },
            { path: 'utilities/elevation', component: ElevationComponent },
            { path: 'utilities/flexbox', component: FlexboxComponent },
            { path: 'utilities/grid', component: GridComponent },
            { path: 'utilities/icons', component: IconsComponent },
            { path: 'utilities/widgets', component: WidgetsComponent },
            { path: 'utilities/spacing', component: SpacingComponent },
            { path: 'utilities/typography', component: TypographyComponent },
            { path: 'utilities/text', component: TextComponent },
            { path: 'pages/empty', component: EmptyDemoComponent },
            { path: 'pages/crud', component: AppCrudComponent },
            { path: 'pages/calendar', component: AppCalendarComponent },
            { path: 'pages/timeline', component: AppTimelineDemoComponent },
            { path: 'components/charts', component: ChartsDemoComponent },
            { path: 'components/file', component: FileDemoComponent },
            { path: 'documentation', component: DocumentationComponent }
        ]
    },
    { path: 'error', component: AppErrorComponent },
    { path: 'accessdenied', component: AppAccessdeniedComponent },
    { path: 'notfound', component: AppNotfoundComponent },
    { path: 'login', component: SignInComponent}, 
    { path: '**', redirectTo: '/notfound' },
]
@NgModule({
    imports: [
        RouterModule.forRoot(routes, { useHash: true, scrollPositionRestoration: 'enabled' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
