import { NgModule, isDevMode } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

// PrimeNG — solo los usados realmente en la app
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MenuModule } from 'primeng/menu';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { PasswordModule } from 'primeng/password';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RippleModule } from 'primeng/ripple';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SidebarModule } from 'primeng/sidebar';
import { SkeletonModule } from 'primeng/skeleton';
import { SliderModule } from 'primeng/slider';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TreeModule } from 'primeng/tree';
import { TabMenuModule } from 'primeng/tabmenu';
import { StepsModule } from 'primeng/steps';

// Application Components
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppMainComponent } from './app.main.component';
import { AppNotfoundComponent } from './pages/app.notfound.component';
import { AppErrorComponent } from './pages/app.error.component';
import { AppAccessdeniedComponent } from './pages/app.accessdenied.component';
import { AppMenuComponent } from './app.menu.component';
import { AppMenuitemComponent } from './app.menuitem.component';
import { AppTopBarComponent } from './app.topbar.component';

// Auth
import { SignInComponent } from './login/sign-in/sign-in.component';

// Modules
import { MainModule } from './modules/main/main.module';
import { ProductModule } from './modules/product/product.module';
import { AlertModule } from './directives/alert/alert.module';
import { DialogUpdateWebModule } from './modules/dialogUpdateWeb/dialogUpdateWeb.module';
import { DialogUpdateWebComponent } from './modules/dialogUpdateWeb/dialogUpdateWeb.component';

// Custom components
import { NotificationConfigModalComponent } from './modules/notification-config/notification-config-modal.component';
import { AppUpdateModalComponent } from './modules/app-update/app-update-modal.component';

// Services & interceptors
import { JWTInterceptor } from './utils/jwt-interceptor';
import { ErrorInterceptor } from './utils/error-interceptor';
import { PushService } from './modules/service/push.service';
import { MenuService } from './app.menu.service';
import { MqttService } from './modules/service/mqtt.service';
import { MqttRoutingService } from './modules/service/mqtt.routing.service';
import { OrderHandler } from './modules/service/handlers/order.handler';
import { StoreHandler } from './modules/service/handlers/store.handler';
import { GeoMessageHandlerService } from './modules/service/geo.message.handler.service';

// Print
import { PrintTemplateModule } from './print-template/print-template.module';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        // PrimeNG
        AccordionModule,
        AutoCompleteModule,
        AvatarModule,
        BadgeModule,
        ButtonModule,
        CalendarModule,
        CardModule,
        ChartModule,
        CheckboxModule,
        ChipModule,
        ConfirmDialogModule,
        ConfirmPopupModule,
        DialogModule,
        DividerModule,
        DropdownModule,
        FileUploadModule,
        ImageModule,
        InputNumberModule,
        InputSwitchModule,
        InputTextModule,
        InputTextareaModule,
        MenuModule,
        MessageModule,
        MessagesModule,
        MultiSelectModule,
        OverlayPanelModule,
        PanelModule,
        PasswordModule,
        ProgressBarModule,
        ProgressSpinnerModule,
        RadioButtonModule,
        RippleModule,
        SelectButtonModule,
        SidebarModule,
        SkeletonModule,
        SliderModule,
        SplitButtonModule,
        StepsModule,
        TabMenuModule,
        TableModule,
        TabViewModule,
        TagModule,
        TimelineModule,
        ToastModule,
        ToggleButtonModule,
        ToolbarModule,
        TooltipModule,
        TreeModule,
        // App modules
        MainModule,
        ProductModule,
        AlertModule,
        DialogUpdateWebModule,
        PrintTemplateModule,
    ],
    declarations: [
        AppComponent,
        AppMainComponent,
        AppMenuComponent,
        AppMenuitemComponent,
        AppTopBarComponent,
        AppNotfoundComponent,
        AppErrorComponent,
        AppAccessdeniedComponent,
        SignInComponent,
        DialogUpdateWebComponent,
        NotificationConfigModalComponent,
        AppUpdateModalComponent,
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: HTTP_INTERCEPTORS, useClass: JWTInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        PushService,
        MenuService,
        MqttService,
        MqttRoutingService,
        OrderHandler,
        StoreHandler,
        GeoMessageHandlerService,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}