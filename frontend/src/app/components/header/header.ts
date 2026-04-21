import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AiAssistantComponent } from '../ai-assistant/ai-assistant';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, AiAssistantComponent],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  auth = inject(AuthService);

  logout(): void {
    this.auth.logout();
  }
}
