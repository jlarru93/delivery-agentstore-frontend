import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { AppMainComponent } from './app.main.component';
import { AppNotfoundComponent } from './pages/app.notfound.component';
import { AppErrorComponent } from './pages/app.error.component';
import { AppAccessdeniedComponent } from './pages/app.accessdenied.component';
import { IsAuthenticated, IsNotAuthenticated } from './utils/auth-guard';
import { SignInComponent } from './login/sign-in/sign-in.component';
import { PrintTemplateComponent } from './print-template/print-template.component';

const routes: Routes = [
    {
        path: '', component: AppMainComponent,
        canActivate: [IsAuthenticated],
        children: [
            //APP
            { 
                path: '',
                loadChildren: () => import('./modules/main/main.module').then(m => m.MainModule), canActivate: [IsAuthenticated]
            },
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
                loadChildren: () => import('./modules/request-trip/request-trip.module').then(m => m.RequestTripModule), canActivate: [IsAuthenticated]
            },
            {
                path: "order-history",
                loadChildren: () => import('./modules/order-history/order-history.module').then(m => m.OrderHistoryModule), canActivate: [IsAuthenticated]
            },
            {
                path: "order-course",
                loadChildren: () => import('./modules/order-course/order-course.module').then(m => m.OrderCourseModule), canActivate: [IsAuthenticated]
            },
            {
                path: "complaint-report",
                loadChildren: () => import('./modules/complaint-report/complaint-report.module').then(m => m.ComplaintReportModule), canActivate: [IsAuthenticated]
            },
            {
                path: "user-report",
                loadChildren: () => import('./modules/user-report/user-report.module').then(m => m.UserReportModule), canActivate: [IsAuthenticated]
            },
            {
                path: "multiple-assignment",
                loadChildren: () => import('./modules/multi-assigment/multiAssigment.module').then(m => m.MultiAssigmentModule), canActivate: [IsAuthenticated]
            },
            {
                path: "dynamic-report",
                loadChildren: () => import('./modules/dynamic-report/dynamic-report.module').then(m => m.DynamicReportModule)
            }
            //THEME
            /*{ path: '', component: DashboardDemoComponent },
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
            { path: 'documentation', component: DocumentationComponent }*/
        ]
    },
    { path: 'error', component: AppErrorComponent },
    { path: 'accessdenied', component: AppAccessdeniedComponent },
    { path: 'notfound', component: AppNotfoundComponent },
    { path: 'print', component: PrintTemplateComponent },
    { path: 'login', component: SignInComponent, canActivate: [IsNotAuthenticated]}, 
    { path: '**', redirectTo: '/notfound' }
]
@NgModule({
    imports: [
        RouterModule.forRoot(routes, { useHash: true, scrollPositionRestoration: 'enabled' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
