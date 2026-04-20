import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AiAssistantComponent } from '../ai-assistant/ai-assistant';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, AiAssistantComponent],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {}
